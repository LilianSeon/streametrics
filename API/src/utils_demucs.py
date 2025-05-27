import subprocess
import os

def isolate_vocals(input_path, output_dir="./demucs_output"):
    """
    Demucs pour extraire la voix d'un fichier audio.
    """
    os.makedirs(output_dir, exist_ok=True)

    try:
        # Appelle Demucs avec l'option pour ne garder que les voix
        subprocess.run([
            "demucs", "--two-stems=vocals", "-o", output_dir, input_path
        ], check=True)

        # Demucs génère le fichier dans un sous-dossier par nom de fichier
        basename = os.path.splitext(os.path.basename(input_path))[0]
        vocals_path = os.path.join(output_dir, "htdemucs", basename, "vocals.wav")

        if not os.path.exists(vocals_path):
            raise FileNotFoundError("Fichier vocal non trouvé après traitement Demucs.")

        return vocals_path

    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Erreur lors de l'exécution de Demucs : {e}")