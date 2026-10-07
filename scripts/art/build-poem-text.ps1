$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$target = Join-Path $root 'public/assets/experience/xp/poem/text.png'

$groups = @(
    @{ y=8; lines=@('唯有牡丹真国色','花开时节动京城','朱红从水墨间苏醒','层叠花瓣如冠冕','盛唐气象徐徐展开') },
    @{ y=340; lines=@('神都西苑移花','史实记载','寒冬牡丹拒开','民间传说') },
    @{ y=535; lines=@('御苑春日宴游','宫门徐徐开启','私园繁花渐盛','百姓踏青赏花','牡丹走入人间') },
    @{ y=965; lines=@('凤穿牡丹入嫁衣','年画灯彩寄祥瑞','铜镜瓷盏留花影','愿岁岁安泰圆满') },
    @{ y=1485; lines=@('沉香亭畔花如锦','云想衣裳花想容','贵妃簪花映盛世','马嵬坡上风雨起','繁华散作红花瓣','残垣前花开依旧','洛阳花海年年盛','落瓣升空汇成冠','牡丹真国色') }
)

$bitmap = New-Object System.Drawing.Bitmap 2304,2304
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.Clear([System.Drawing.Color]::Black)
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$red = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,255,0,0))
$font = New-Object System.Drawing.Font ('KaiTi', 34, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$fontHeavy = New-Object System.Drawing.Font ('KaiTi', 37, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
foreach ($group in $groups) {
    $y = [int]$group.y
    foreach ($line in $group.lines) {
        $graphics.DrawString($line, $font, $red, 8, $y)
        $graphics.DrawString($line, $fontHeavy, $red, 420, $y)
        $graphics.DrawString($line, $fontHeavy, $red, 840, $y)
        $width = [Math]::Min(360, [Math]::Max(135, $line.Length * 38))
        $graphics.FillRectangle($red, 1260, $y + 8, $width, 32)
        $y += 47
    }
}
$bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose(); $bitmap.Dispose(); $font.Dispose(); $fontHeavy.Dispose(); $red.Dispose()
