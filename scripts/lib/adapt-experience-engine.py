"""Deterministic adapter for the archived third-party graphics runtime.

Keep shader, camera, timeline, interaction and atlas code unchanged. Only visible
localization, resource roots and diagnostic bootstrap handles are adapted.
"""


def adapt_engine(source: str) -> str:
    replacements = [
        ('Open the landscape', '走入画卷'),
        ('"./wp-content/themes/davidwhyte/resources/assets/"', '(window.__MUDANG_BASE_URL__+"assets/experience/")'),
        ('"./wp-content/themes/davidwhyte/resources/assets"', '(window.__MUDANG_BASE_URL__+"assets/experience")'),
        ('"wp-content/themes/davidwhyte/resources/assets/xp/videos/"', '(window.__MUDANG_BASE_URL__+"assets/experience/xp/videos/")'),
        ('"./wp-content/themes/davidwhyte/resources/assets/xp/libs/basis/"', '(window.__MUDANG_BASE_URL__+"assets/experience/xp/libs/basis/")'),
        ('"wp-content/themes/davidwhyte/app/427.js"', '"vendor/experience/chunks/427.js"'),
        ('"wp-content/themes/davidwhyte/loader"', '"vendor/experience/loader"'),
        ('"wp-content/themes/davidwhyte/style"', '"vendor/experience/style"'),
        ('o.p="/"', 'o.p=window.__MUDANG_BASE_URL__'),
        ('var tit=new Krt;', 'var tit=new Krt;window.__MUDANG_LEGACY_APP__=tit;'),
        ('t.next=2,tit.run()', 't.next=2,(window.__MUDANG_LEGACY_READY__=tit.run())'),
    ]
    for before, after in replacements:
        if before not in source:
            raise ValueError(f'Missing expected engine adapter anchor: {before}')
        source = source.replace(before, after)
    return source
