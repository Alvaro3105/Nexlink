"""Gera os crachás da equipe NexLink a partir de equipe.json.

Uso (na raiz do repositório, com um servidor local rodando):
    python -m http.server 8765
    python cracha/gerar.py

Saídas em cracha/saida/:
    NN-nome-frente.png / NN-nome.pdf (frente e verso, 54 x 86 mm)
    verso.png
    folha-a4.pdf (todas as frentes em uma página, todos os versos espelhados na outra, 600 dpi)
"""
import asyncio, itertools, json, re, unicodedata
CONT = itertools.count()
from pathlib import Path
from playwright.async_api import async_playwright

AQUI = Path(__file__).resolve().parent
SAIDA = AQUI / "saida"
BASE_URL = "http://localhost:8765/cracha/"
CHROME = "/usr/bin/google-chrome"

def slug(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")

def partes():
    html = (AQUI / "index.html").read_text(encoding="utf-8")
    head = re.search(r"<style>(.*?)</style>", html, re.S).group(1)
    fontes = "\n".join(l for l in head.splitlines() if "@font-face" in l)
    frente = re.search(r'<div class="cartao" id="frente">\s*(.*?)\s*</div></section>', html, re.S).group(1)
    verso = re.search(r'<div class="cartao" id="verso">\s*(.*?)\s*</div></section>', html, re.S).group(1)
    return fontes, frente, verso

def frente_de(m, frente):
    foto = (f'<img src="{m["foto"]}" alt="" style="width: 78px; height: 78px; border-radius: 50%; object-fit: cover; display: block">'
            if m.get("foto") else
            '<div style="width: 78px; height: 78px; border-radius: 50%; background: #DCE6F4; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; color: #1D5BD6">'
            + "".join(p[0] for p in m["nome"].split()[:2]).upper() + "</div>")
    f = re.sub(r'<div style="width: 78px; height: 78px;[^>]*>FOTO</div>', foto, frente)
    f = f.replace("[Seu Nome]", m["nome"]).replace("[Função]", m["funcao"]).replace("[0001]", m["id"])
    return f

def pagina(fontes, corpo, css_extra=""):
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
{fontes}
body {{ margin: 0; font-family: 'Nunito', system-ui, sans-serif; }}
* {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: content-box; }}
{css_extra}
</style></head><body>{corpo}</body></html>"""

CSS_FOLHA = """
@page { size: 210mm 297mm; margin: 0; }
.folha { width: 210mm; height: 297mm; position: relative; page-break-after: always; break-after: page; overflow: hidden; }
.grade { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: grid; grid-template-columns: repeat(3, 54mm); grid-auto-rows: 86mm; gap: 8mm; }
.slot { position: relative; width: 54mm; height: 86mm; }
.slot > .c { width: 204px; height: 325px; transform-origin: 0 0; transform: scale(calc(54mm / 204px)); }
.marca { position: absolute; background: #000; }
.titulo { position: absolute; left: 0; right: 0; top: 10mm; text-align: center; font: 700 9pt 'Nunito', sans-serif; color: #555; }
"""

def marcas():
    L = "4mm"; o = "-6mm"
    m = []
    for v in ("top: 0", "bottom: 0"):
        m.append(f'<span class="marca" style="{v}; left: {o}; width: {L}; height: 0.2mm"></span>')
        m.append(f'<span class="marca" style="{v}; right: {o}; width: {L}; height: 0.2mm"></span>')
    for hpos in ("left: 0", "right: 0"):
        m.append(f'<span class="marca" style="{hpos}; top: {o}; width: 0.2mm; height: {L}"></span>')
        m.append(f'<span class="marca" style="{hpos}; bottom: {o}; width: 0.2mm; height: {L}"></span>')
    return "".join(m)

async def main():
    equipe = json.loads((AQUI / "equipe.json").read_text(encoding="utf-8"))
    fontes, frente, verso = partes()
    SAIDA.mkdir(exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME)
        pg = await b.new_page(device_scale_factor=6)

        async def render(html, nome_tmp):
            arq = AQUI / f"_{nome_tmp}.html"
            arq.write_text(html, encoding="utf-8")
            await pg.goto(BASE_URL + arq.name + f"?v={next(CONT)}")
            await pg.evaluate("document.fonts.ready")
            await pg.wait_for_timeout(300)
            return arq

        # verso (igual para todos)
        arq = await render(pagina(fontes, f'<div id="c" style="width:204px;height:325px">{verso}</div>'), "verso")
        await pg.locator("#c").screenshot(path=str(SAIDA / "verso.png"))
        arq.unlink()

        for m in equipe:
            nome = f'{int(m["id"]):02d}-{slug(m["nome"])}'
            f = frente_de(m, frente)
            arq = await render(pagina(fontes, f'<div id="c" style="width:204px;height:325px">{f}</div>'), "frente")
            await pg.locator("#c").screenshot(path=str(SAIDA / f"{nome}-frente.png"))
            corpo = (f'<div style="width:204px;height:325px;overflow:hidden;break-after:page">{f}</div>'
                     f'<div style="width:204px;height:325px;overflow:hidden">{verso}</div>')
            arq.write_text(pagina(fontes, corpo, "@page { size: 54mm 86mm; margin: 0; } body{zoom:1}"), encoding="utf-8")
            await pg.goto(BASE_URL + arq.name + f"?v={next(CONT)}"); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(300)
            await pg.pdf(path=str(SAIDA / f"{nome}.pdf"), width="54mm", height="86mm", print_background=True,
                         margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
            arq.unlink()
            print("ok", nome)

        await b.close()


def folha_a4(equipe):
    """Monta a folha A4 (600 dpi) com as frentes na página 1 e os versos espelhados na página 2."""
    from PIL import Image, ImageDraw
    DPI = 600
    mm = lambda v: round(v / 25.4 * DPI)
    W, H = mm(210), mm(297)
    cw, ch, gap = mm(54), mm(86), mm(8)
    gx = (W - (3 * cw + 2 * gap)) // 2
    gy = (H - (2 * ch + gap)) // 2
    def pagina(imagens, titulo):
        pg = Image.new("RGB", (W, H), "white")
        d = ImageDraw.Draw(pg)
        for idx, im in enumerate(imagens):
            if im is None:
                continue
            col, lin = idx % 3, idx // 3
            x, y = gx + col * (cw + gap), gy + lin * (ch + gap)
            pg.paste(im.resize((cw, ch), Image.LANCZOS), (x, y))
            L, o, t = mm(4), mm(1.5), max(2, mm(0.15))
            for yy in (y, y + ch):
                d.rectangle((x - o - L, yy - t // 2, x - o, yy + t // 2), fill="black")
                d.rectangle((x + cw + o, yy - t // 2, x + cw + o + L, yy + t // 2), fill="black")
            for xx in (x, x + cw):
                d.rectangle((xx - t // 2, y - o - L, xx + t // 2, y - o), fill="black")
                d.rectangle((xx - t // 2, y + ch + o, xx + t // 2, y + ch + o + L), fill="black")
        try:
            from PIL import ImageFont
            f = ImageFont.truetype("DejaVuSans.ttf", mm(3))
        except Exception:
            f = None
        d.text((W // 2, mm(12)), titulo, fill="#555555", anchor="mm", font=f)
        return pg
    frentes = [Image.open(SAIDA / f'{int(m["id"]):02d}-{slug(m["nome"])}-frente.png').convert("RGB") for m in equipe]
    verso = Image.open(SAIDA / "verso.png").convert("RGB")
    versos = []
    for i in range(0, len(frentes), 3):
        linha = [verso] * len(frentes[i:i + 3]) + [None] * (3 - len(frentes[i:i + 3]))
        versos += list(reversed(linha))
    p1 = pagina(frentes, "Crachás NexLink - FRENTES - imprimir em 100% (tamanho real)")
    p2 = pagina(versos, "Crachás NexLink - VERSOS - imprimir no verso da mesma folha")
    p1.save(SAIDA / "folha-a4.pdf", save_all=True, append_images=[p2], resolution=DPI)
    print("ok folha-a4.pdf")

if __name__ == "__main__":
    asyncio.run(main())
    folha_a4(json.loads((AQUI / "equipe.json").read_text(encoding="utf-8")))
