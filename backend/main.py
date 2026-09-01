import json
import subprocess
import tempfile
from pathlib import Path

import librosa
import numpy as np

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

        return {
            "success": True,

            "reference": {
                "filename": reference.filename,
                "sample_rate": reference_sr,
                "samples": len(reference_audio),
                "duration": len(reference_audio) / reference_sr,
            },

            "recording": {
                "filename": recording.filename,
                "sample_rate": recording_sr,
                "samples": len(recording_audio),
                "duration": len(recording_audio) / recording_sr,
            },

            "rig": rig_data,
        }