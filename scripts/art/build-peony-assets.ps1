$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$xp = Join-Path $root 'public/assets/experience/xp'
$art = Join-Path $root 'materials/artwork/experience'
$atlas = Join-Path $xp 'textures/atlas'
$ffmpeg = (Get-Command ffmpeg).Source

& $ffmpeg -hide_banner -loglevel error -y -i (Join-Path $art 'peony-atlas-ai.png') -vf 'scale=4096:4096:flags=lanczos' -q:v 2 (Join-Path $atlas 'texture.jpg')
if ($LASTEXITCODE -ne 0) { throw 'Atlas conversion failed' }
& $ffmpeg -hide_banner -loglevel error -y -i (Join-Path $art 'peony-atlas-ai.png') -vf "format=gray,lut=y='if(gte(val,12),255,0)',scale=4096:4096:flags=lanczos" -q:v 2 (Join-Path $atlas 'texture_mask.jpg')
if ($LASTEXITCODE -ne 0) { throw 'Mask conversion failed' }

for ($i = 1; $i -le 6; $i++) {
    $source = Join-Path $art ("scene-{0:00}.png" -f $i)
    foreach ($device in @('desktop', 'mobile')) {
        foreach ($layer in @('base', 'over')) {
            $target = Join-Path $xp ("videos/$device/$layer/$i.mp4")
            $directory = Split-Path -Parent $target
            New-Item -ItemType Directory -Force -Path $directory | Out-Null
            if ($device -eq 'desktop') { $scale = "scale=2000:1125,crop=1920:1080:x='40+20*sin(n/30)':y='22+10*cos(n/30)'" }
            else { $scale = "scale=2000:1125,crop=810:1080:x='595+25*sin(n/30)':y='22+10*cos(n/30)'" }
            if ($layer -eq 'base') { $grade = 'eq=contrast=0.72:saturation=0.45:brightness=0.15' }
            else { $grade = 'eq=contrast=0.88:saturation=0.82:brightness=0.05' }
            & $ffmpeg -hide_banner -loglevel error -y -loop 1 -framerate 15 -i $source -t 10 -vf "$scale,$grade,format=yuv420p" -c:v libx264 -preset ultrafast -crf 27 -movflags +faststart -an $target
            if ($LASTEXITCODE -ne 0) { throw "Video conversion failed: $target" }
        }
    }
}

$python = if ($env:PYTHON) { $env:PYTHON } else { (Get-Command python -ErrorAction Stop).Source }
& $python (Join-Path $PSScriptRoot 'rebuild-atlas-masks.py')
if ($LASTEXITCODE -ne 0) { throw 'Atlas alignment failed' }
