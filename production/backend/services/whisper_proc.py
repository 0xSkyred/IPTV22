import sys
import json
from faster_whisper import WhisperModel

# Script chamado pelo Node.js para processar áudio na GPU
# faster-whisper é 4x mais rápido que o whisper original

def process_audio(input_file, output_json):
    # Load model on GPU (cuda)
    model_size = "large-v3"
    model = WhisperModel(model_size, device="cuda", compute_type="float16")

    segments, info = model.transcribe(input_file, beam_size=5)

    results = []
    for segment in segments:
        results.append({
            "start": segment.start,
            "end": segment.end,
            "text": segment.text
        })

    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    audio_path = sys.argv[1]
    json_path = sys.argv[2]
    process_audio(audio_path, json_path)
