from pathlib import Path
import json
import hashlib
import zipfile

site = Path("dist-pages")
cfg = json.loads(Path("versao.json").read_text(encoding="utf-8"))
version = cfg["version"]
if not version or not all(c.isalnum() or c in ".-_" for c in version):
    raise ValueError("Versão inválida")
updates = site / "updates"
updates.mkdir(exist_ok=True)
bundle = updates / f"sudoklue-{version}.zip"
with zipfile.ZipFile(bundle, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=8) as z:
    for path in sorted(site.rglob("*")):
        if not path.is_file() or "updates" in path.relative_to(site).parts:
            continue
        z.write(path, path.relative_to(site).as_posix())
sha256 = hashlib.sha256(bundle.read_bytes()).hexdigest()
manifest = {
    "bundleId": version,
    "url": f"https://danielgx21.github.io/Sudoklue/updates/{bundle.name}",
    "sha256": sha256,
    "nativeFormat": cfg["nativeFormat"],
}
(updates / "latest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print(f"Sudoklue bundle: {bundle} / sha256: {sha256}")
