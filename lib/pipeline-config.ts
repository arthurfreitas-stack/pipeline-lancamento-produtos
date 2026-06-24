export type FieldType = "text" | "textarea" | "number" | "checkbox" | "select" | "select_multi" | "date"

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  options?: string[]
  placeholder?: string
}

export interface BlockDef {
  code: string
  title: string
  fields: FieldDef[]
}

export interface PhaseDef {
  number: number
  code: string
  title: string
  objective: string
  gateQuestion: string
  gateCriteria: string[]
  blocks: BlockDef[]
}

export const PHASES: PhaseDef[] = [
  {
    number: 0,
    code: "F0",
    title: "Descoberta & Sizing",
    objective: "Entender se existe mercado, demanda e espaço de preço suficientes para o produto valer uma investigação séria.",
    gateQuestion: "Vale investigar a fundo?",
    gateCriteria: [
      "Mercado relevante + sinal de demanda reprimida",
      "Preço de varejo alto o bastante para a dor de não querer desembolsar à vista existir",
      "Não é nicho minúsculo nem produto em queda estrutural",
    ],
    blocks: [
      {
        code: "A",
        title: "Mercado & Demanda",
        fields: [
          { key: "tam_sam_som", label: "TAM / SAM / SOM", type: "textarea", placeholder: "Ex: TAM R$800M (mercado total), SAM R$200M (segmento acessível), SOM R$20M (meta realista)..." },
          { key: "demanda_reprimida", label: "Existe demanda reprimida? Como se manifesta?", type: "textarea", placeholder: "Ex: gente que quer mas não compra por preço/crédito..." },
          { key: "volume_busca", label: "Volume de busca e tendência (fonte)", type: "textarea", placeholder: "Ex: 40k buscas/mês no Google Trends, tendência crescente desde 2022..." },
          { key: "sazonalidade", label: "Sazonalidade — melhor e pior época", type: "textarea", placeholder: "Ex: pico em janeiro (ano novo), queda em junho/julho..." },
          { key: "regioes", label: "Regiões do Brasil que mais compram", type: "text", placeholder: "Ex: SP, RJ, Sul" },
          {
            key: "cluster_vida",
            label: "Cluster de momento de vida",
            type: "select",
            options: ["Família com bebê", "Jovem adulto", "Estudante", "Profissional", "Esportista", "Outro"],
          },
        ],
      },
      {
        code: "B",
        title: "Concorrência, Preço & Oferta",
        fields: [
          { key: "quem_vende", label: "Quem vende no Brasil (marketplaces/lojas principais)", type: "textarea" },
          { key: "quem_assina", label: "Quem aluga/assina no Brasil (concorrente direto no modelo)", type: "textarea" },
          { key: "preco_medio", label: "Preço médio de venda no varejo (R$)", type: "number" },
          { key: "preco_minimo", label: "Preço mínimo encontrado (R$)", type: "number" },
          { key: "preco_maximo", label: "Preço máximo encontrado (R$)", type: "number" },
          { key: "condicao_venda", label: "Condição de venda comum", type: "text", placeholder: "Ex: 12x sem juros, PIX 5% OFF..." },
          { key: "ofertas_comuns", label: "Ofertas comuns no mercado", type: "textarea" },
          { key: "fabricantes", label: "Fabricantes do produto", type: "textarea" },
          { key: "fornecedores_preliminar", label: "Fornecedores e revendedores (lista inicial)", type: "textarea" },
        ],
      },
    ],
  },
  {
    number: 1,
    code: "F1",
    title: "Fit de Assinatura",
    objective: "Responder se este produto faz sentido em assinatura. Produz o Subscription-Fit Score.",
    gateQuestion: "Faz sentido assinar este produto?",
    gateCriteria: [
      "Subscription-Fit Score ≥ 60 (ou 40–60 com hipótese clara de compensação)",
      "Pelo menos um argumento anti-compra forte e verdadeiro",
    ],
    blocks: [
      {
        code: "C",
        title: "Ciclo de vida e uso",
        fields: [
          { key: "ciclo_medio", label: "Ciclo médio de utilização", type: "text", placeholder: "Ex: 18–24 meses" },
          { key: "durabilidade", label: "Durabilidade física (qtd contratos suportados)", type: "text", placeholder: "Ex: 3–4 contratos de 12 meses" },
          {
            key: "tipo_uso",
            label: "Tipo de uso",
            type: "select",
            options: ["Contínuo", "Esporádico", "Temporário"],
          },
          { key: "tempo_troca", label: "Tempo médio até querer trocar", type: "text", placeholder: "Ex: 12–18 meses" },
        ],
      },
      {
        code: "D",
        title: "Obsolescência, upgrade e revenda",
        fields: [
          { key: "obsolescencia_relevante", label: "Obsolescência programada é relevante?", type: "checkbox" },
          { key: "upside_upgrade", label: "Tem upside de upgrade? (lança modelo novo frequentemente)", type: "checkbox" },
          { key: "obs_upgrade", label: "Observações sobre upgrade", type: "textarea" },
          { key: "fator_revenda", label: "Fator revenda (dificuldade + argumento para assinatura)", type: "textarea", placeholder: "Ex: revenda usada complexa, perda de 40–60% do valor — forte argumento para assinar" },
          { key: "curva_depreciacao_pct", label: "Depreciação % — (preço compra − revenda) / preço compra", type: "number" },
        ],
      },
      {
        code: "E",
        title: "Seguro e risco",
        fields: [
          { key: "seguro_possivel", label: "É possível segurar o produto?", type: "checkbox" },
          { key: "custo_seguro_pct", label: "Custo do seguro (% do valor do produto ao mês)", type: "number" },
          {
            key: "risco_furto_dano",
            label: "Risco de furto/dano",
            type: "select",
            options: ["Alto", "Médio", "Baixo"],
          },
        ],
      },
    ],
  },
  {
    number: 2,
    code: "F2",
    title: "Modelagem do Produto",
    objective: "Transformar o produto em oferta de assinatura allu com unit economics que fecha.",
    gateQuestion: "A unit economics fecha?",
    gateCriteria: [
      "Yield-alvo atingível com margem líquida positiva (ou plano explícito de penetração com data de correção)",
      "Pelo menos 1 fornecedor com condição comercial real validada",
      "Projeção de faturamento × custo positiva no horizonte definido",
    ],
    blocks: [
      {
        code: "F",
        title: "Fornecedor e originação",
        fields: [
          { key: "fornecedores_lista", label: "Lista de fornecedores com contato", type: "textarea" },
          {
            key: "modelo_aquisicao",
            label: "Modelo de aquisição",
            type: "select",
            options: ["Compra", "Consignação", "Sublocação", "Comodato"],
          },
          { key: "volume_minimo", label: "Volume mínimo de compra (unidades)", type: "number" },
          { key: "prazo_entrega_fornecedor", label: "Prazo de entrega do fornecedor", type: "text" },
          { key: "parceria_originacao", label: "Possibilidade de parceria de originação?", type: "checkbox" },
          { key: "garantia_compativel", label: "Garantia do fornecedor compatível com assinatura?", type: "checkbox" },
          { key: "obs_garantia", label: "Observações sobre garantia", type: "textarea" },
        ],
      },
      {
        code: "G",
        title: "Modelagem da assinatura",
        fields: [
          {
            key: "planos",
            label: "Planos a oferecer",
            type: "select_multi",
            options: ["6m", "12m", "18m", "24m", "36m"],
          },
          { key: "yield_alvo_pct", label: "Yield-alvo (%)", type: "number", placeholder: "Ex: 8.5" },
          { key: "camada_servico", label: "Camada de serviço inclusa", type: "textarea", placeholder: "Ex: proteção contra roubo, assistência técnica, troca após 4 meses..." },
          { key: "bundles", label: "Brindes, acessórios e bundles possíveis", type: "textarea" },
          { key: "yield_real_capital_pct", label: "Yield real sobre capital total mobilizado (%)", type: "number", placeholder: "Ex: 4.7 (lição allu Baby: 8% por produto vira 4.7% sobre capital)" },
          {
            key: "estrategia_preco",
            label: "Estratégia de preço",
            type: "select",
            options: ["Penetração 4–5%", "Justo/Sustentável 7–11%"],
          },
        ],
      },
      {
        code: "H",
        title: "Ficha de produto e fiscal",
        fields: [
          { key: "nome_completo", label: "Nome completo do produto", type: "text" },
          { key: "sku", label: "SKU", type: "text" },
          { key: "ficha_tecnica", label: "Ficha técnica completa", type: "textarea" },
          { key: "imagens_videos_links", label: "Links de imagens, fotos e vídeos (ou arquivos)", type: "textarea", placeholder: "Cole URLs do Drive, Dropbox, YouTube..." },
          { key: "ncm", label: "NCM", type: "text" },
          { key: "aliquota_pct", label: "Alíquota tributária (%)", type: "number" },
          { key: "projecao_funil", label: "Projeção de funil — volume esperado por mês", type: "textarea" },
          { key: "projecao_faturamento", label: "Projeção faturamento × custo", type: "textarea" },
        ],
      },
    ],
  },
  {
    number: 3,
    code: "F3",
    title: "Operacionalização & Cadastro",
    objective: "Deixar o produto vendável e atendível — cadastrado, precificado, com IA e time treinados.",
    gateQuestion: "Está pronto para vender e atender?",
    gateCriteria: [
      "Produto cadastrado e comprável no site (teste de compra real feito)",
      "IA e vendas sabem responder as objeções do produto",
      "Fluxo de assistência/sinistro definido (não lançar sem saber quem conserta)",
    ],
    blocks: [
      {
        code: "I",
        title: "Cadastro e sistemas",
        fields: [
          { key: "precificacao_ok", label: "Subido para precificação", type: "checkbox" },
          { key: "alluoffice_ok", label: "Cadastrado no AlluOffice", type: "checkbox" },
          { key: "sap_ok", label: "Cadastrado no SAP", type: "checkbox" },
          { key: "imagens_site_ok", label: "Imagens no site", type: "checkbox" },
          { key: "descricao_site_ok", label: "Descrição e ficha técnica no site", type: "checkbox" },
          { key: "tags_pixel_ok", label: "Tags de evento Meta e GA4 configuradas", type: "checkbox" },
        ],
      },
      {
        code: "J",
        title: "Habilitar vendas e atendimento",
        fields: [
          { key: "ia_treinada_ok", label: "IA treinada sobre o produto", type: "checkbox" },
          { key: "time_treinado_ok", label: "Time de vendas treinado", type: "checkbox" },
          { key: "template_atendimento", label: "Template de atendimento (perguntas + objeções)", type: "textarea" },
          { key: "video_unboxing_ok", label: "Vídeo de unboxing gravado", type: "checkbox" },
        ],
      },
      {
        code: "K",
        title: "Fluxos de CRM e pós-venda",
        fields: [
          { key: "fluxo_recuperacao_ok", label: "Fluxo de recuperação checkout WhatsApp criado", type: "checkbox" },
          { key: "email_lancamento_ok", label: "Email de lançamento criado", type: "checkbox" },
          { key: "email_recuperacao_ok", label: "Email de recuperação de checkout criado", type: "checkbox" },
          { key: "segmento_hubspot", label: "Segmento HubSpot — tag", type: "text", placeholder: "Ex: lead-patinete-checkout-abandonado" },
          { key: "fluxo_assistencia", label: "Fluxo de assistência técnica/sinistro", type: "textarea", placeholder: "Ex: interno ou terceirizado? SLA? Quem conserta?" },
          { key: "teste_compra_ok", label: "Teste de compra real feito", type: "checkbox" },
        ],
      },
    ],
  },
  {
    number: 4,
    code: "F4",
    title: "Go-to-Market",
    objective: "Colocar tráfego qualificado no funil do produto e gerar os primeiros pedidos.",
    gateQuestion: "Os primeiros sinais sustentam escalar?",
    gateCriteria: [
      "Funil quente (cross-sell) já rodou e deu sinal",
      "Criativo/LP com sinal mínimo (CTR, checkout iniciado) acima do piso",
      "CPA dos primeiros pedidos dentro de uma faixa que não destrói a unit economics",
    ],
    blocks: [
      {
        code: "L",
        title: "Estratégia de lançamento",
        fields: [
          {
            key: "tipo_lancamento",
            label: "Tipo de lançamento",
            type: "select",
            options: ["Soft launch", "Com influenciador", "Meteórico"],
          },
          { key: "verba_midia", label: "Verba de mídia dedicada (R$)", type: "number" },
          {
            key: "destino_trafego",
            label: "Destino do tráfego",
            type: "select",
            options: ["LP da categoria", "VSL", "Página de produto"],
          },
          { key: "split_tofu_pct", label: "Split TOFU (%)", type: "number" },
          { key: "split_mofu_pct", label: "Split MOFU (%)", type: "number" },
          { key: "split_bofu_pct", label: "Split BOFU (%)", type: "number" },
        ],
      },
      {
        code: "M",
        title: "Funis paralelos",
        fields: [
          { key: "funil_frio", label: "Estratégia funil frio", type: "textarea", placeholder: "Público que nunca considerou assinar — educa 'assinar > comprar'" },
          { key: "funil_quente", label: "Estratégia funil quente (cross-sell)", type: "textarea", placeholder: "Base ativa sem o produto — CAC 3–5x menor, rodar primeiro" },
          { key: "segmentacao_crm", label: "Segmentação CRM (HubSpot)", type: "textarea", placeholder: "Ex: tem iPhone, não tem notebook" },
          { key: "regua_recuperacao_ok", label: "Régua de recuperação de checkout ligada", type: "checkbox" },
        ],
      },
      {
        code: "N",
        title: "Criativos e mídia",
        fields: [
          { key: "qtd_criativos_batch", label: "Quantidade de criativos no batch inicial", type: "number" },
          { key: "copys_argumentos", label: "Copys e argumentos principais", type: "textarea", placeholder: "Anti-compra, demanda reprimida, momento de vida..." },
          { key: "formatos_criativos", label: "Formatos", type: "textarea", placeholder: "Ex: vídeo TOFU 15–30s, carrossel MOFU, estático BOFU + cupom" },
          { key: "keywords", label: "Palavras-chave Google Search", type: "textarea" },
          { key: "segmentacao_campanha", label: "Segmentação da campanha", type: "textarea", placeholder: "Ex: interesse, lookalike, retargeting" },
          { key: "criterio_vencedor", label: "Critério de criativo vencedor", type: "textarea", placeholder: "Ex: CTR > 2%, CPA < R$300" },
          { key: "parceria_distribuicao", label: "Parceria de distribuição avaliada", type: "textarea" },
        ],
      },
    ],
  },
  {
    number: 5,
    code: "F5",
    title: "Validação & Decisão",
    objective: "Com tráfego e pedidos rodando, decidir formalmente: VALIDAR (rampar) ou INVALIDAR (matar).",
    gateQuestion: "VALIDAR ou INVALIDAR?",
    gateCriteria: [
      "Atingiu metas de pedidos brutos e líquidos",
      "MRR novo dentro da meta definida",
      "CPA e taxa de aprovação sustentáveis para a unit economics",
    ],
    blocks: [
      {
        code: "O",
        title: "Janela e metas de validação",
        fields: [
          { key: "tempo_teste_dias", label: "Tempo de teste (dias)", type: "number", placeholder: "Ex: 30" },
          { key: "verba_teste", label: "Verba alocada para teste (R$)", type: "number" },
          { key: "meta_pedidos_brutos", label: "Meta de pedidos brutos", type: "number" },
          { key: "meta_pedidos_liquidos", label: "Meta de pedidos líquidos", type: "number" },
          { key: "meta_mrr", label: "Meta de MRR novo (R$)", type: "number" },
          { key: "meta_faturamento", label: "Meta de faturamento (R$)", type: "number" },
          { key: "criterio_kill", label: "Critério explícito de Kill", type: "textarea", placeholder: "Ex: se CPA líquido > R$400 ou aprovação < 50% após 30 dias" },
        ],
      },
      {
        code: "P",
        title: "Escuta de mercado",
        fields: [
          { key: "entrevistas", label: "Entrevistas com leads e clientes", type: "textarea" },
          { key: "pesquisa_van_westendorp", label: "Pesquisa de preço Van Westendorp", type: "textarea" },
          { key: "condicao_especial_respondentes", label: "Condição especial para respondentes", type: "text" },
          { key: "objecoes_reais", label: "Objeções reais do atendimento", type: "textarea", placeholder: "Alimenta IA e copy" },
        ],
      },
      {
        code: "Q",
        title: "Decisão de precificação",
        fields: [
          { key: "yield_teste_pct", label: "Yield baixo para teste (%)", type: "number", placeholder: "Ex: 4.5" },
          { key: "reprojecao_funil", label: "Reprojeção de funil com dados reais", type: "textarea" },
          { key: "reprojecao_faturamento", label: "Reprojeção faturamento × custo com dados reais", type: "textarea" },
        ],
      },
    ],
  },
  {
    number: 6,
    code: "F6",
    title: "Rampagem & Gestão de Share",
    objective: "Escalar o produto validado e gerenciá-lo como uma unidade de negócio dentro do portfólio.",
    gateQuestion: "Fase contínua — sem gate de saída.",
    gateCriteria: [],
    blocks: [
      {
        code: "R",
        title: "KPIs operacionais (scorecard)",
        fields: [
          { key: "taxa_aprovacao_pct", label: "Taxa aprovação bruto → líquido (%)", type: "number" },
          { key: "ticket_medio", label: "Ticket médio (R$)", type: "number" },
          { key: "ganho_incremental", label: "Ganho incremental (R$)", type: "number" },
          { key: "pct_new_to_brand", label: "% new-to-brand", type: "number" },
          { key: "investimento_midia_mensal", label: "Investimento de mídia (R$/mês)", type: "number" },
          { key: "custo_operacional_mensal", label: "Custo operacional (R$/mês)", type: "number" },
          { key: "cpa_bruto", label: "CPA bruto (R$)", type: "number" },
          { key: "cpa_liquido", label: "CPA líquido (R$)", type: "number" },
          { key: "taxa_cancelamento_7d_pct", label: "Taxa de cancelamento 7 dias (%)", type: "number" },
          { key: "churn_pct", label: "Taxa de churn (%)", type: "number" },
          { key: "obs_funil", label: "Observações sobre conversões do funil", type: "textarea" },
        ],
      },
      {
        code: "S",
        title: "Gestão de share e portfólio",
        fields: [
          { key: "share_mrr_pct", label: "Share de MRR da categoria (%) — meta: 20%", type: "number" },
          {
            key: "papel_portfolio",
            label: "Papel no portfólio",
            type: "select",
            options: ["Destino", "Rotina", "Sazonal", "Teste"],
          },
          { key: "alocacao_verba", label: "Decisão de realocação de verba", type: "textarea" },
          { key: "cac_crosssell", label: "CAC cross-sell (R$)", type: "number" },
          { key: "cac_frio", label: "CAC funil frio (R$)", type: "number" },
          { key: "defleet_decisao", label: "Decisão de ciclo de vida/defleet", type: "textarea" },
          { key: "ugc_pipeline", label: "Pipeline de UGC/depoimentos", type: "textarea" },
        ],
      },
    ],
  },
]

export const PHASE_STATUS_LABELS: Record<number, string> = {
  0: "Descoberta",
  1: "Fit",
  2: "Modelagem",
  3: "Operacionalização",
  4: "Go-to-Market",
  5: "Validação",
  6: "Rampagem",
}

export const CATEGORIES = [
  "Smartphone",
  "Notebook",
  "Tablet",
  "TV",
  "Wearable",
  "Mobilidade",
  "Baby",
  "Eletrodoméstico",
  "Console",
  "Outro",
]

export const DECISION_CONFIG = {
  go: { label: "Go", icon: "✅", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
  kill: { label: "Kill", icon: "❌", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
  recycle: { label: "Recycle", icon: "🔁", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  hold: { label: "Hold", icon: "⏸", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
} as const

export const FIT_SCORE_AXES = [
  { key: "axisBarrier", label: "Barreira de preço", weight: 5, description: "O preço à vista afasta o público-alvo?" },
  { key: "axisDemand", label: "Demanda reprimida", weight: 5, description: "Muita gente quer e não consegue comprar?" },
  { key: "axisOwnershipPain", label: "Dor da posse", weight: 4, description: "Comprar dá dor (desvaloriza, trava limite, revenda ruim)?" },
  { key: "axisUpgrade", label: "Upside de upgrade", weight: 4, description: "O cliente vai querer trocar por modelo novo?" },
  { key: "axisDurability", label: "Durabilidade do ativo", weight: 4, description: "Aguenta vários contratos sem virar sucata?" },
  { key: "axisTicket", label: "Ticket / yield", weight: 3, description: "Ticket sustenta yield de 7–11%?" },
  { key: "axisOperation", label: "Operação viável", weight: 3, description: "Logística, assistência e sinistro são gerenciáveis?" },
  { key: "axisTempUse", label: "Uso temporário", weight: 2, description: "O uso é por fase/temporada (devolve e recircula)?" },
] as const

export function calcFitScore(axes: Record<string, number>): { score: number; recommendation: "go" | "conditional" | "kill" } {
  const maxRaw = FIT_SCORE_AXES.reduce((sum, a) => sum + a.weight * 5, 0) // 150
  const raw = FIT_SCORE_AXES.reduce((sum, a) => sum + (axes[a.key] ?? 0) * a.weight, 0)
  const score = Math.round((raw / maxRaw) * 100)
  const recommendation = score >= 60 ? "go" : score >= 40 ? "conditional" : "kill"
  return { score, recommendation }
}

export function getPhaseCompletionRate(
  fields: Array<{ fieldKey: string; valueText?: string | null; valueNumber?: number | null; valueBoolean?: boolean | null; valueDate?: Date | null }>,
  phase: PhaseDef,
): { filled: number; total: number; pct: number } {
  const allFields = phase.blocks.flatMap((b) => b.fields)
  const total = allFields.length
  if (total === 0) return { filled: 0, total: 0, pct: 0 }

  const filled = allFields.filter((f) => {
    const saved = fields.find((sf) => sf.fieldKey === f.key)
    if (!saved) return false
    if (f.type === "checkbox") return saved.valueBoolean !== null && saved.valueBoolean !== undefined
    if (f.type === "number") return saved.valueNumber !== null && saved.valueNumber !== undefined
    if (f.type === "date") return saved.valueDate !== null && saved.valueDate !== undefined
    return saved.valueText !== null && saved.valueText !== undefined && saved.valueText.trim() !== ""
  }).length

  return { filled, total, pct: Math.round((filled / total) * 100) }
}
