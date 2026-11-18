# NexLink

**Conectando conhecimento.** Tecnologia que aproxima. Soluções que transformam.

A NexLink é um projeto do curso técnico de Informática da COTEMIG. A equipe trabalha com infraestrutura de redes, manutenção de PCs, sistemas de câmeras CFTV e estações de trabalho.

## O site

O site é estático, feito só com HTML, CSS e JavaScript, sem frameworks. Ele tem:

- **Serviços, diferenciais e base técnica**, com cards e ícones.
- **Playspace:** oito objetos de escritório. Cada um mostra uma curiosidade e faz uma pergunta rápida, e um contador marca o progresso.
- **Laboratório**, com três experimentos interativos:
  - simulação de um pacote de rede, em que você pode desligar o cabo, o switch ou o roteador;
  - placa-mãe com componentes clicáveis;
  - calculadora da Lei de Ohm com lâmpada.
- **Equipe**, com cards que abrem o perfil de cada integrante.
- **NexLink Matter:** animação de partículas que reage ao mouse e ao toque, com temas (Rede, Computador, Processador, Câmera, Energia) e um botão "Big Bang".
- Layout responsivo e acessível: navegação por teclado, foco visível e respeito à preferência de reduzir animações.

### Estrutura

```
index.html
assets/
  css/style.css
  js/main.js
  fonts/        # Nunito (SIL Open Font License)
  img/favicon.svg
cracha/         # crachá da equipe (frente, verso, PDF e QR code)
```

### Como editar a equipe

Abra `assets/js/main.js` e procure a lista `EQUIPE`. Para cada integrante, troque o nome, a função e as responsabilidades. Para usar uma foto, coloque a imagem em `assets/img/equipe/` e informe o caminho no campo `foto`.

### Rodar localmente

```bash
python -m http.server 8000
# abra http://localhost:8000
```

## Crachá

Os arquivos do crachá ficam em [`cracha/`](cracha/).
