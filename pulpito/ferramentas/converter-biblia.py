"""Converte o JSON da Bíblia Livre (github.com/eversondeveloper/bibialivrejson,
arquivo biblialivrecorrecao1.json) para o formato compacto do Púlpito:

    {"versao": "BLIVRE", "nome": "...", "livros": [[[versículo, ...], ...], ...]}

livros[0] = Gênesis ... livros[65] = Apocalipse; capítulo e versículo começam em 0.

Uso: python3 converter-biblia.py ENTRADA.json ../biblia/blivre.json
"""
import ast
import json
import re
import sys

entrada, saida = sys.argv[1], sys.argv[2]
dados = json.load(open(entrada, encoding="utf-8-sig"))[1:]  # o item 0 são os créditos do arquivo
assert len(dados) == 66, "esperava 66 livros"
livros = []
for livro in dados:
    caps = livro["capitulos"]
    if isinstance(caps, str):
        caps = ast.literal_eval(caps)  # o arquivo guarda os capítulos como texto
    livros.append([
        # "Salmo de Davi:O SENHOR" -> "Salmo de Davi: O SENHOR"
        [re.sub(r"(\w):(?=[A-ZÁÉÍÓÚÂÊÔÃÕ])", r"\1: ", v.strip()) for v in cap]
        for cap in caps
    ])
json.dump(
    {"versao": "BLIVRE", "nome": "Bíblia Livre", "livros": livros},
    open(saida, "w", encoding="utf-8"),
    ensure_ascii=False,
    separators=(",", ":"),
)
print(sum(len(v) for l in livros for v in l), "versículos")
