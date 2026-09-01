import json
import subprocess
import tempfile
from pathlib import Path

import librosa
import numpy as np

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
HOP_LENGTH = 512
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def trim_audio(audio):
    trimmed_audio, _ = librosa.effects.trim(
        audio,
        top_db=40,
    )

    return trimmed_audio

def get_chroma(audio, sample_rate):
    return librosa.feature.chroma_cqt(
        y=audio,
        sr=sample_rate,
        hop_length=HOP_LENGTH,
    )


def compare_band_energy(
    reference_bands,
    recording_bands,
    warping_path,
):
    differences = {
        name: []
        for name in reference_bands
    }

    for reference_frame, recording_frame in warping_path:

        for name in reference_bands:

            reference_values = reference_bands[name]
            recording_values = recording_bands[name]

            if (
                reference_frame < len(reference_values)
                and recording_frame < len(recording_values)
            ):
                difference = (
                    recording_values[recording_frame]
                    - reference_values[reference_frame]
                )

                differences[name].append(difference)

    return {
        name: float(np.median(values) * 100)
        for name, values in differences.items()
        if values
    }

def get_band_energy(audio, sample_rate):
    stft = librosa.stft(
        audio,
        n_fft=2048,
        hop_length=HOP_LENGTH,
    )

    power = np.abs(stft) ** 2

    frequencies = librosa.fft_frequencies(
        sr=sample_rate,
        n_fft=2048,
    )

    bands = {
        "bass": (80, 250),
        "low_mids": (250, 500),
        "mids": (500, 1000),
        "upper_mids": (1000, 2000),
        "treble": (2000, 4000),
        "high_treble": (4000, 6000),
        "presence": (6000, 10000),
    }

    total_power = np.sum(power, axis=0) + 1e-10

    band_energy = {}

    for name, (low, high) in bands.items():
        mask = (frequencies >= low) & (frequencies < high)

        energy = np.sum(
            power[mask],
            axis=0,
        )

        # Percentage of total energy in this frame
        band_energy[name] = energy / total_power

    return band_energy

def filter_alignment(
    reference_chroma,
    recording_chroma,
    reference_rms,
    recording_rms,
    warping_path,
    similarity_threshold=0.7,
    energy_threshold_db=-40,
):
    confident_path = []
    similarities = []

    for reference_frame, recording_frame in warping_path:


        if (
            reference_frame >= len(reference_rms)
            or recording_frame >= len(recording_rms)
        ):
            continue

        if (
            reference_rms[reference_frame] < energy_threshold_db
            or recording_rms[recording_frame] < energy_threshold_db
        ):
            continue



        reference_vector = reference_chroma[:, reference_frame]
        recording_vector = recording_chroma[:, recording_frame]

        denominator = (
            np.linalg.norm(reference_vector)
            * np.linalg.norm(recording_vector)
        )

        if denominator == 0:
            continue

        similarity = np.dot(
            reference_vector,
            recording_vector,
        ) / denominator

        similarities.append(similarity)

        if similarity >= similarity_threshold:
            confident_path.append(
                [reference_frame, recording_frame]
            )

    return (
        np.array(confident_path),
        similarities,
    )

def collapse_alignment(warping_path):
    matches = {}

    for reference_frame, recording_frame in warping_path:
        reference_frame = int(reference_frame)
        recording_frame = int(recording_frame)

        if reference_frame not in matches:
            matches[reference_frame] = []

        matches[reference_frame].append(recording_frame)

    collapsed_path = []

    for reference_frame, recording_frames in matches.items():
        recording_frame = int(
            np.median(recording_frames)
        )

        collapsed_path.append(
            [reference_frame, recording_frame]
        )

    return np.array(collapsed_path)

def align_audio(
    reference_audio,
    recording_audio,
    sample_rate,
):
    reference_audio = trim_audio(reference_audio)
    recording_audio = trim_audio(recording_audio)

    reference_chroma = get_chroma(
        reference_audio,
        sample_rate,
    )

    recording_chroma = get_chroma(
        recording_audio,
        sample_rate,
    )

    _, warping_path = librosa.sequence.dtw(
        X=reference_chroma,
        Y=recording_chroma,
        metric="cosine",
    )

    warping_path = warping_path[::-1]

    return (
        reference_audio,
        recording_audio,
        reference_chroma,
        recording_chroma,
        warping_path,
    )

def compare_brightness(
    reference_brightness,
    recording_brightness,
    warping_path,
):
    differences = []

    for reference_frame, recording_frame in warping_path:
        if (
            reference_frame < len(reference_brightness)
            and recording_frame < len(recording_brightness)
        ):
            reference_value = reference_brightness[reference_frame]
            recording_value = recording_brightness[recording_frame]

            differences.append(
                recording_value - reference_value
            )

    return float(np.median(differences))

def get_brightness(audio, sample_rate):
    brightness = librosa.feature.spectral_centroid(
        y=audio,
        sr=sample_rate,
        hop_length=HOP_LENGTH,
    )[0]

    return brightness

def convert_to_wav(input_path: Path, output_path: Path):
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(input_path),
            "-ac",
            "1",
            "-ar",
            "48000",
            str(output_path),
        ],
        check=True,
        capture_output=True,
    )

def get_rms_db(audio):
    rms = librosa.feature.rms(
        y=audio,
        frame_length=2048,
        hop_length=HOP_LENGTH,
    )[0]

    rms_db = librosa.amplitude_to_db(
        rms,
        ref=np.max,
    )

    return rms_db



def clamp(value, minimum=0, maximum=100):
    return max(minimum, min(maximum, value))


def get_adjustment_size(difference):
    difference = abs(difference)

    if difference < 2:
        return 0

    if difference < 5:
        return 3

    if difference < 10:
        return 5

    return 8


def generate_eq_suggestions(
    band_differences,
    rig_controls,
):
    suggestions = []

    # Combine related frequency bands into the controls
    # a normal amp/modeler is likely to have.
    control_differences = {
        "bass": band_differences.get("bass", 0),

        "mids": float(np.median([
            band_differences.get("low_mids", 0),
            band_differences.get("mids", 0),
            band_differences.get("upper_mids", 0),
        ])),

        "treble": float(np.median([
            band_differences.get("treble", 0),
            band_differences.get("high_treble", 0),
        ])),

        "presence": float(np.median([
            band_differences.get("high_treble", 0),
            band_differences.get("presence", 0),
        ])),
    }

    for control_name, difference in control_differences.items():

        control = rig_controls.get(control_name)

        # User doesn't have this control available
        if not control or not control.get("enabled"):
            continue

        current_value = control.get("value", 50)

        adjustment = get_adjustment_size(difference)

        # Difference is too small to bother changing
        if adjustment == 0:
            continue

        # Positive difference means:
        # recording has MORE of this frequency than reference
        if difference > 0:
            suggested_value = current_value - adjustment
            direction = "decrease"

        # Negative means recording has LESS than reference
        else:
            suggested_value = current_value + adjustment
            direction = "increase"

        suggested_value = clamp(suggested_value)

        suggestions.append({
            "control": control_name,
            "current": current_value,
            "suggested": suggested_value,
            "direction": direction,
            "difference": difference,
        })

    return suggestions

@app.post("/analyze-tone")
async def analyze_tone(
    reference: UploadFile = File(...),
    recording: UploadFile = File(...),
    rig: str = Form(...),
):
    reference_bytes = await reference.read()
    recording_bytes = await recording.read()

    rig_data = json.loads(rig)

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_dir = Path(temp_dir)

        reference_input = temp_dir / (
            reference.filename or "reference"
        )

        recording_input = temp_dir / (
            recording.filename or "recording"
        )

        reference_wav = temp_dir / "reference.wav"
        recording_wav = temp_dir / "recording.wav"

        reference_input.write_bytes(reference_bytes)
        recording_input.write_bytes(recording_bytes)

        convert_to_wav(reference_input, reference_wav)
        convert_to_wav(recording_input, recording_wav)

        reference_audio, reference_sr = librosa.load(
            reference_wav,
            sr=48000,
            mono=True,
        )

        recording_audio, recording_sr = librosa.load(
            recording_wav,
            sr=48000,
            mono=True,
        )

        (
            reference_audio,
            recording_audio,
            reference_chroma,
            recording_chroma,
            warping_path,
        ) = align_audio(
            reference_audio,
            recording_audio,
            reference_sr,
        )
        # removes background noise
        reference_rms = get_rms_db(reference_audio)
        recording_rms = get_rms_db(recording_audio)


        # filters uncertain matches
        confident_path, similarities = filter_alignment(
            reference_chroma,
            recording_chroma,
            reference_rms,
            recording_rms,
            warping_path,
        )

        # filters the same note matched to many and collaspes them into one match
        collapsed_path = collapse_alignment(
            confident_path
        )

        reference_brightness = get_brightness(
            reference_audio,
            reference_sr,
        )

        recording_brightness = get_brightness(
            recording_audio,
            recording_sr,
        )

        brightness_difference = compare_brightness(
            reference_brightness,
            recording_brightness,
            collapsed_path,
        )
        reference_bands = get_band_energy(
            reference_audio,
            reference_sr,
        )

        recording_bands = get_band_energy(
            recording_audio,
            recording_sr,
        )

        band_differences = compare_band_energy(
            reference_bands,
            recording_bands,
            collapsed_path,
        )
        rig_controls = rig_data.get("rigControls", {})

        suggestions = generate_eq_suggestions(
            band_differences,
            rig_controls,
        )



        return {
            "success": True,

            "alignment_points": len(warping_path),
            "confident_alignment_points": len(confident_path),
            "collapsed_alignment_points": len(collapsed_path),

            "median_chroma_similarity": float(
                np.median(similarities)
            ),

            "brightness_difference_hz": brightness_difference,
            "band_differences": band_differences,

            "suggestions": suggestions,
        }