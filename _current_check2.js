// 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
// saveGraphs・医Ο繝ｼ繧ｫ繝ｫ・九け繝ｩ繧ｦ繝芽・蜍穂ｿ晏ｭ假ｼ・
// 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
// 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
// 蜷梧悄繝｢繝ｼ繝芽ｨｭ螳・
// 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
let CLOUD_PRIORITY = false;

// 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
// loadFromCloud・医け繝ｩ繧ｦ繝芽・蜍輔Ο繝ｼ繝会ｼ・
// 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
async function loadFromCloud() {
    if (!window.SyncBridge || !SyncBridge.isConfigured()) return;

    const localTs = Number(localStorage.getItem("fm_cloud_last") || 0);

    await SyncBridge.autoLoad("flow-mind", localTs, (cloudData, cloudTs) => {
        if (!cloudData || typeof cloudData !== "object") return;

        // 笏笏 繧ｯ繝ｩ繧ｦ繝牙━蜈医Δ繝ｼ繝・笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
        if (CLOUD_PRIORITY) {
            graphs = cloudData;
            localStorage.setItem("fm_graphs", JSON.stringify(graphs));
            localStorage.setItem("fm_cloud_last", String(cloudTs));

            const ids = Object.keys(graphs);
            if (ids.length > 0) currentGraphId = ids[0];

            renderAll();
            showToast("笘・ｸ・繧ｯ繝ｩ繧ｦ繝牙━蜈医Δ繝ｼ繝会ｼ壹け繝ｩ繧ｦ繝峨°繧牙ｾｩ蜈・＠縺ｾ縺励◆");
            return;
        }

        // 笏笏 繝ｭ繝ｼ繧ｫ繝ｫ蜆ｪ蜈医Δ繝ｼ繝会ｼ域里蟄倥・謖吝虚・・笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
        const msg = `笘・ｸ・繧ｯ繝ｩ繧ｦ繝峨↓譁ｰ縺励＞繝・・繧ｿ縺後≠繧翫∪縺兔n(${new Date(cloudTs).toLocaleString("ja-JP")})\n\n荳頑嶌縺阪＠縺ｦ隱ｭ縺ｿ霎ｼ縺ｿ縺ｾ縺吶°・歔`;
        if (!confirm(msg)) return;

        graphs = cloudData;
        localStorage.setItem("fm_graphs", JSON.stringify(graphs));
        localStorage.setItem("fm_cloud_last", String(cloudTs));

        const ids = Object.keys(graphs);
        if (ids.length > 0) currentGraphId = ids[0];

        renderAll();
        showToast("笘・ｸ・繧ｯ繝ｩ繧ｦ繝峨°繧牙ｾｩ蜈・＠縺ｾ縺励◆");
    });
}

// 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
// 繧ｪ繝ｳ繝ｩ繧､繝ｳ蠕ｩ蟶ｰ譎ゅ・蜀埼・ｼ遺ｻ驥崎､・↑縺暦ｼ・
// 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
window.addEventListener('online', () => {
    if (window.SyncBridge) SyncBridge.retryPending();
    if (window.CloudSync) CloudSync.retryPending();
});



// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// CONSTANTS & STATE
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
const LS_GRAPHS   = 'fm_graphs';
const LS_CURRENT  = 'fm_current';
const LS_CLAUDE   = 'ml_claude';
const LS_GEMINI   = 'ml_gemini';
const LS_OPENAI   = 'ml_openai';
const LS_PROXY    = 'kansei_proxy_url';
const LS_MODEL    = 'kansei_model';
const LS_TRANSFER = 'is_transfer';
// 繝悶Μ繝・ず(quick-ref-bridge遲・縺御ｿ晏ｭ倥・縺溘・縺ｫ閾ｪ蜍暮∽ｿ｡縺吶ｋ蟆ら畑繧ｭ繝ｼ縲・
// 謇句虚縺ｮ縲悟・繝・・繧ｿ荳諡ｬ霆｢騾√・is_transfer)縺ｨ縺ｯ蛻･繧ｭ繝ｼ縺ｪ縺ｮ縺ｧ荳頑嶌縺堺ｺ区腐繧帝∩縺代ｉ繧後ｋ縲・
const LS_EMOTION_TRANSFER = 'is_emotion_transfer';

const MODELS = {
  claude: { label:'Claude', endpoint:'https://api.anthropic.com/v1/messages', model:'claude-sonnet-4-6' },
  gemini: { label:'Gemini', endpoint:'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', model:'gemini-2.0-flash' },
  openai: { label:'OpenAI', endpoint:'https://api.openai.com/v1/chat/completions', model:'gpt-4o-mini' },
};

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 閾ｪ蜍輔ち繧ｰ謚ｽ蜃ｺ・医く繝ｼ繝ｯ繝ｼ繝峨・繝ｼ繧ｹ繝ｻ蜊ｳ譎ゑｼ上が繝輔Λ繧､繝ｳ・・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
const TAG_KEYWORD_DICT = {
  '諢滓ュ-諤偵ｊ':   ['諤偵ｊ','繧､繝ｩ繧､繝ｩ','閻ｹ遶・,'繝繧ｫ'],
  '諢滓ュ-荳榊ｮ・:   ['荳榊ｮ・,'蠢・・','辟ｦ繧・,'諤・],
  '諢滓ュ-蝟懊・':   ['螫峨＠','讌ｽ縺・,'繝ｯ繧ｯ繝ｯ繧ｯ','螳牙ｿ・],
  '莉穂ｺ・:        ['莉穂ｺ・,'讌ｭ蜍・,'譯井ｻｶ','邱蛻・,'繧ｿ繧ｹ繧ｯ'],
  '繧｢繧､繝・い':    ['繧｢繧､繝・い','諤昴＞縺､縺・,'縺ｲ繧峨ａ縺・],
  '莠ｺ髢馴未菫・:    ['蜿倶ｺｺ','螳ｶ譌・,'蜷悟・','諱倶ｺｺ','荳雁昇'],
  '霄ｫ菴・:        ['逍ｲ繧・,'逵','菴楢ｪｿ','逞・],

  '髢狗匱-繝舌げ':   ['繝舌げ','繧ｨ繝ｩ繝ｼ','萓句､・,'荳榊・蜷・,'菫ｮ豁｣'],
  '髢狗匱-險ｭ險・:   ['險ｭ險・,'螳溯｣・,'API','髢｢謨ｰ','莉墓ｧ・,'繝ｪ繝輔ぃ繧ｯ繧ｿ'],
  '髻ｳ讌ｽ':        ['髻ｳ讌ｽ','菴懈峇','繝｡繝ｭ繝・ぅ','豁瑚ｩ・,'讌ｽ譖ｲ'],
  '繧､繝ｩ繧ｹ繝・:    ['繧､繝ｩ繧ｹ繝・,'邱夂判','逹濶ｲ','謠上￥','邨ｵ'],
  '蜊縺・:        ['蜊縺・,'譏・,'蜊ｦ','蜈ｭ蜊∝屁蜊ｦ','蜊陦・],
  '闍ｱ隱槫ｭｦ鄙・:    ['闍ｱ隱・,'闍ｱ譁・,'闍ｱ蜊倩ｪ・,'闍ｱ譁・ｳ・,'逋ｺ髻ｳ'],
  '繧ｻ繧ｭ繝･繝ｪ繝・ぅ':['繧ｻ繧ｭ繝･繝ｪ繝・ぅ','閼・ｼｱ諤ｧ','XSS','證怜捷','隱崎ｨｼ'],
  'CAD':         ['CAD','3D繝｢繝・Ν','STEP','STL','蠖｢迥ｶ'],
  '莨夊ｨ・:        ['莨夊ｨ・,'邨檎炊','莉戊ｨｳ','豎ｺ邂・,'隲区ｱ・],
};

function extractTagsFromText(label, memo) {
  const text = ((label || '') + ' ' + (memo || '')).toLowerCase();
  const tags = [];
  for (const [tag, kws] of Object.entries(TAG_KEYWORD_DICT)) {
    if (kws.some(kw => text.includes(kw.toLowerCase()))) tags.push(tag);
  }
  return tags;
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 諢滓ュ縺ｮ迚ｩ逅・Δ繝・Ν 窶・螳壽焚・・髫主ｱ､・・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 竭 髮ｻ闕ｷ縺ｮ貂幄｡ｰ騾溷ｺｦ・域凾螳壽焚 ﾏ・ ms・・
const CHARGE_DECAY_TAU = 4000;
// 竭 逋ｺ轣ｫ縺励″縺・､
const FIRE_CHARGE_BOOST = 0.7;
// 竭｡ 莨晄眺蜉ｹ邇・ｼ磯崕豬≫・髮ｻ蝣ｴ繝ｻ逎∝ｴ縺ｮ繧｢繝翫Ο繧ｸ繝ｼ・壹お繝・ず縺ｮconductance縺ｧ蠅怜ｹ・ｼ・
const PROPAGATION_FACTOR = 0.42;
// 竭 Hebbian蠑ｷ蛹門ｹ・ｼ亥酔譎ら匱轣ｫ縺ｧconductance縺御ｼｸ縺ｳ繧矩㍼・・
const HEBBIAN_STEP = 0.04;
// 竭｢ 蜷梧悄讀懷・縺ｮ譎る俣遯難ｼ・s・俄・縺薙・遯灘・縺ｮ逋ｺ轣ｫ繧偵悟酔譛溘阪→縺ｿ縺ｪ縺・
const SYNC_WINDOW_MS = 2200;
// 竭｢ 蜻ｨ豕｢謨ｰ蟶ｯ縺ｮ蠅・阜・・z逶ｸ蠖薙∫匱轣ｫ髢馴囈縺九ｉ騾・ｮ励＠縺溽桝莨ｼ蜻ｨ豕｢謨ｰ・・
const BAND_THRESH = { gamma:30, beta:13, alpha:8, theta:4 };
// 竭｢ 蟶ｯ蝓溘＃縺ｨ縺ｮ濶ｲ繝ｻ騾溷ｺｦ・亥庄隕門喧逕ｨ・・
const BAND_STYLE = {
  gamma: { color:'#FF5F5F', speed:1.0, label:'ﾎｳ豕｢・域偵ｊ繝ｻ髮・ｸｭ・・ },
  beta:  { color:'#FB923C', speed:0.7, label:'ﾎｲ豕｢・域晁・・邱雁ｼｵ・・ },
  alpha: { color:'#4AE09A', speed:0.45,label:'ﾎｱ豕｢・医Μ繝ｩ繝・け繧ｹ・・ },
  theta: { color:'#C084FC', speed:0.3, label:'ﾎｸ豕｢・井ｸ榊ｮ峨・險俶・・・ },
  delta: { color:'#4A9EFF', speed:0.18,label:'ﾎｴ豕｢・域ｷｱ縺・ュ蜍包ｼ・ },
};
// 竭｣ attractor蛻､螳壹ユ繝ｼ繝悶Ν・亥ｸｯ蝓・ﾃ・蟇・ｺｦ ﾃ・謖∫ｶ壽凾髢・竊・諢滓ュ繝ｩ繝吶Ν・・
function classifyAttractor(cluster) {
  const { band, density, durationMs, size } = cluster;
  if (size < 2) return null;
  if (band === 'gamma') {
    if (density > 0.6 && durationMs > 2800) return { label:'諤偵ｊ', color:BAND_STYLE.gamma.color };
    return { label:'髮・ｸｭ', color:BAND_STYLE.gamma.color };
  }
  if (band === 'beta') {
    return durationMs > 3000 ? { label:'邱雁ｼｵ', color:BAND_STYLE.beta.color } : { label:'諤晁・ｸｭ', color:BAND_STYLE.beta.color };
  }
  if (band === 'alpha') {
    return { label:'繝ｪ繝ｩ繝・け繧ｹ', color:BAND_STYLE.alpha.color };
  }
  if (band === 'theta') {
    return density > 0.5 ? { label:'荳榊ｮ・, color:BAND_STYLE.theta.color } : { label:'諠ｳ襍ｷ', color:BAND_STYLE.theta.color };
  }
  if (band === 'delta') {
    return durationMs > 5000 ? { label:'豺ｱ縺・ュ蜍・, color:BAND_STYLE.delta.color } : null;
  }
  return null;
}

// Canvas
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

// Viewport transform
let vpX = 0, vpY = 0, vpScale = 1;

// Graph data
let graphs = {};      // { id: { name, nodes:{}, edges:[] } }
let currentGraphId = null;

function currentGraph() { return graphs[currentGraphId] || null; }
function nodes() { return currentGraph()?.nodes || {}; }
function edges() { return currentGraph()?.edges || []; }

// Modes
const MODE = { ADD:'add', CONNECT:'connect', EDIT:'edit' };
let mode = MODE.ADD;
let connectFrom = null;   // nodeId of connect source
let selectedNode = null;  // nodeId
let selectedEdge = null;  // {from,to} index

// Drag
let dragging = null;  // { nodeId, offX, offY }
let isPanning = false;
let panStart = { x:0, y:0, vpX:0, vpY:0 };
let lastTap = { time:0, x:0, y:0 };

// Animation
let animFrame = null;
let glowPhase = 0;
let lastFrameTime = performance.now();

// 迴ｾ蝨ｨ縺ｮattractor迥ｶ諷具ｼ遺促 繧ｯ繧ｪ繝ｪ繧｢螻､・・
let currentAttractor = null;
let currentSyncClusters = [];
// 繧ｯ繧､繝・け險倬鹸縺ｮ閾ｪ蜍墓磁邯壹↓菴ｿ縺・檎峩蜑阪↓逋ｺ轣ｫ縺励◆繝弱・繝峨・
let lastFiredNodeId = null;

// Node default
const NODE_R = 38;
let editingNodeId = null;
let editingNodeColor = '#4A9EFF';

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// FLOWCHART LAYOUT 窶・蟶ｸ譎ゅ∵ｧ矩蛹悶＆繧後◆荳岩・荳九・繝ｬ繧､繧｢繧ｦ繝医↓謨ｴ蛻励＆縺帙ｋ
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 繧ｨ繝・ず縺ｮ蜷代″(from竊稚o)繧剃ｽｿ縺｣縺ｦ蜷・ヮ繝ｼ繝峨・縲碁嚴螻､(level)縲阪ｒ豎ｺ繧√・
// 蜷後§髫主ｱ､縺ｮ繝弱・繝峨・讓ｪ縺ｫ荳ｦ縺ｹ繧九ゅΝ繝ｼ繝・蠕ｪ迺ｰ)縺後≠繧句ｴ蜷医・縲√◎縺薙□縺・
// 譛ｪ遒ｺ螳壹・縺ｾ縺ｾ谿九ｋ縺ｮ縺ｧ縲∵怙蠕後↓縺ｾ縺ｨ繧√※譛ｫ蟆ｾ縺ｮ髫主ｱ､縺ｸ驟咲ｽｮ縺吶ｋ縲・
function applyFlowchartLayout() {
  const g = currentGraph();
  if (!g) return;
  const ids = Object.keys(g.nodes);
  if (ids.length === 0) return;

  const inDeg = {};
  ids.forEach(id => { inDeg[id] = 0; });
  g.edges.forEach(e => { if (inDeg[e.to] !== undefined) inDeg[e.to]++; });

  const outAdj = {};
  ids.forEach(id => { outAdj[id] = []; });
  g.edges.forEach(e => { if (outAdj[e.from]) outAdj[e.from].push(e.to); });

  const level = {};
  const queue = [];
  ids.forEach(id => { if (inDeg[id] === 0) { level[id] = 0; queue.push(id); } });

  const inDegWork = Object.assign({}, inDeg);
  let qi = 0;
  while (qi < queue.length) {
    const cur = queue[qi++];
    outAdj[cur].forEach(nb => {
      level[nb] = Math.max(level[nb] !== undefined ? level[nb] : 0, level[cur] + 1);
      inDegWork[nb]--;
      if (inDegWork[nb] === 0 && level[nb] !== undefined && !queue.includes(nb)) queue.push(nb);
    });
  }

  // 蠕ｪ迺ｰ縺ｪ縺ｩ縺ｧ譛ｪ遒ｺ螳壹・縺ｾ縺ｾ谿九▲縺溘ヮ繝ｼ繝峨・縲∵怙螟ｧ髫主ｱ､縺ｮ谺｡縺ｫ縺ｾ縺ｨ繧√※驟咲ｽｮ
  let maxLevel = 0;
  Object.values(level).forEach(l => { if (l > maxLevel) maxLevel = l; });
  ids.forEach(id => { if (level[id] === undefined) { maxLevel++; level[id] = maxLevel; } });

  // 髫主ｱ､縺斐→縺ｫ繧ｰ繝ｫ繝ｼ繝斐Φ繧ｰ縺励※讓ｪ縺ｫ荳ｦ縺ｹ繧・
  const byLevel = {};
  ids.forEach(id => {
    const l = level[id];
    (byLevel[l] = byLevel[l] || []).push(id);
  });

  const LEVEL_SPACING = 190; // 荳贋ｸ九・髢馴囈
  const NODE_SPACING = 130;  // 蜷碁嚴螻､蜀・・蟾ｦ蜿ｳ髢馴囈

  Object.keys(byLevel).map(Number).sort((a,b) => a-b).forEach(lvl => {
    const row = byLevel[lvl];
    row.forEach((id, i) => {
      const n = g.nodes[id];
      n.x = (i - (row.length - 1) / 2) * NODE_SPACING;
      n.y = lvl * LEVEL_SPACING;
    });
  });
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// UTILS
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function saveGraphs() {
  if (currentGraphId && graphs[currentGraphId]) graphs[currentGraphId].updatedAt = Date.now();
  try { localStorage.setItem(LS_GRAPHS, JSON.stringify(graphs)); } catch(e) { showToast('菫晏ｭ伜ｮｹ驥上′荳崎ｶｳ縺励※縺・∪縺・); }
  // Windows/PC 縺ｧ繝輔か繝ｫ繝謗･邯壽ｸ医∩縺ｪ繧芽・蜍輔〒iCloud Drive縺ｸ繧よ嶌縺崎ｾｼ繧・医ョ繝舌え繝ｳ繧ｹ貂医∩繝ｻ譛ｪ謗･邯壹↑繧我ｽ輔ｂ縺励↑縺・ｼ・
  if (window.SyncBridge) SyncBridge.autoSave('flow-mind', graphs);
  // 繧ｯ繝ｩ繧ｦ繝・蜈ｨ遶ｯ譛ｫ蜈ｱ騾・縺瑚ｨｭ螳壽ｸ医∩縺ｪ繧峨◎縺｡繧峨↓繧り・蜍墓嶌縺崎ｾｼ縺ｿ
  if (window.CloudSync) CloudSync.cloudSave('flow-mind', graphs);
}

function loadGraphs() {
  try {
    const raw = localStorage.getItem(LS_GRAPHS);
    graphs = raw ? JSON.parse(raw) : {};
    currentGraphId = localStorage.getItem(LS_CURRENT) || null;
    if (!currentGraphId || !graphs[currentGraphId]) {
      // 繝・ヵ繧ｩ繝ｫ繝医げ繝ｩ繝穂ｽ懈・
      createGraph('縺ｯ縺倥ａ縺ｦ縺ｮ繧ｰ繝ｩ繝・);
    }
  } catch(e) { graphs = {}; createGraph('繧ｰ繝ｩ繝・'); }
}

function createGraph(name) {
  const id = uid();
  graphs[id] = { name, nodes:{}, edges:[], createdAt: Date.now() };
  currentGraphId = id;
  localStorage.setItem(LS_CURRENT, id);
  saveGraphs();
  return id;
}

function switchGraph(id) {
  currentGraphId = id;
  localStorage.setItem(LS_CURRENT, id);
  connectFrom = null; selectedNode = null;
  lastFiredNodeId = null;
  applyFlowchartLayout();
  centerView();
  updateScoreBar();
  updateInboxBadge();
  renderGraphList();
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// PAGE RANK 窶・驥崎ｦ∝ｺｦ繧ｹ繧ｳ繧｢險育ｮ・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function computeScores() {
  const g = currentGraph();
  if (!g) return {};
  const nids = Object.keys(g.nodes);
  if (nids.length === 0) return {};

  // 蛻晄悄繧ｹ繧ｳ繧｢ = 閾ｪ蟾ｱ驥阪∩
  const scores = {};
  nids.forEach(id => { scores[id] = g.nodes[id].weight || 3; });

  // 蜿榊ｾｩ・・蝗橸ｼ・
  for (let iter = 0; iter < 3; iter++) {
    const next = {};
    nids.forEach(id => { next[id] = g.nodes[id].weight || 3; }); // 閾ｪ蟾ｱ驥阪∩縺後・繝ｼ繧ｹ
    g.edges.forEach(e => {
      const w = e.weight || 1;
      // to繝弱・繝峨・from繝弱・繝峨・繧ｹ繧ｳ繧｢繧貞女縺大叙繧・
      if (next[e.to] !== undefined && scores[e.from] !== undefined) {
        next[e.to] += scores[e.from] * w * 0.4;
      }
    });
    Object.assign(scores, next);
  }

  // 豁｣隕丞喧 [0..1]
  const max = Math.max(...Object.values(scores));
  if (max > 0) nids.forEach(id => { scores[id] = scores[id] / max; });
  return scores;
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 竭 竭｡ 諢滓ュ縺ｮ迚ｩ逅・Δ繝・Ν 窶・髮ｻ闕ｷ縺ｮ豬√ｌ縺ｨ莨晄眺
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 繝弱・繝峨ｒ縲檎匱轣ｫ縲阪＆縺帙ｋ・医ち繝・・・晄ｴｻ蜍暮崕菴阪・逋ｺ逕滂ｼ・
function fireNode(id) {
  const g = currentGraph();
  const n = g?.nodes[id];
  if (!n) return;

  ensurePhysicsFields(n);
  const now = Date.now();
  // 竭 逋ｺ轣ｫ螻･豁ｴ繧定ｨ倬鹸・育峩霑・莉ｶ縺ｾ縺ｧ菫晄戟・・
  n.fireHistory.push(now);
  if (n.fireHistory.length > 8) n.fireHistory.shift();
  n.lastFired = now;
  n.charge = Math.min(1, n.charge + FIRE_CHARGE_BOOST);
  lastFiredNodeId = id;

  // 竭｡ 髮ｻ豬√′豬√ｌ繧・竊・髫｣謗･繝弱・繝峨∈髮ｻ蝣ｴ繝ｻ逎∝ｴ縺ｮ繧医≧縺ｫ莨晄眺
  const outEdges = g.edges.filter(e => e.from === id || e.to === id);
  outEdges.forEach(e => {
    ensureEdgePhysics(e);
    const otherId = e.from === id ? e.to : e.from;
    const other = g.nodes[otherId];
    if (!other) return;
    ensurePhysicsFields(other);

    const transferred = n.charge * (e.weight || 1) * e.conductance * PROPAGATION_FACTOR;
    other.charge = Math.min(1, other.charge + transferred);

    // 竭 蜷梧凾逋ｺ轣ｫ縺励※縺・◆繧ｨ繝・ず縺ｯ莨晏ｰ守紫・医す繝翫・繧ｹ蠑ｷ蠎ｦ・峨ｒ蠑ｷ蛹厄ｼ扎ebbian learning
    const otherRecentlyFired = other.lastFired && (now - other.lastFired < SYNC_WINDOW_MS);
    if (otherRecentlyFired) {
      e.conductance = Math.min(2, e.conductance + HEBBIAN_STEP);
    }
  });

  saveGraphs();
}

function ensurePhysicsFields(n) {
  if (n.charge === undefined) n.charge = 0;
  if (!n.fireHistory) n.fireHistory = [];
  if (n.lastFired === undefined) n.lastFired = 0;
}
function ensureEdgePhysics(e) {
  if (e.conductance === undefined) e.conductance = 1.0;
}

// charge 縺ｮ譎る俣貂幄｡ｰ・医ヵ繝ｬ繝ｼ繝縺斐→縺ｫ蜻ｼ縺ｶ・・
function decayCharges(dtMs) {
  const g = currentGraph();
  if (!g) return;
  const decayFactor = Math.exp(-dtMs / CHARGE_DECAY_TAU);
  Object.values(g.nodes).forEach(n => {
    if (n.charge) n.charge *= decayFactor;
    if (n.charge < 0.01) n.charge = 0;
  });
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 竭｢ 逾樒ｵ後ロ繝・ヨ繝ｯ繝ｼ繧ｯ縺ｮ蜷梧悄讀懷・・医さ繝偵・繝ｬ繝ｳ繧ｹ・・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function estimateFreqBand(n) {
  const h = n.fireHistory;
  if (!h || h.length < 2) return null;
  // 逶ｴ霑代・逋ｺ轣ｫ髢馴囈縺ｮ蟷ｳ蝮・ｼ・s・・竊・逍台ｼｼ蜻ｨ豕｢謨ｰ・・z・峨↓螟画鋤
  const recent = h.slice(-4);
  let totalGap = 0, count = 0;
  for (let i = 1; i < recent.length; i++) {
    totalGap += recent[i] - recent[i-1];
    count++;
  }
  if (count === 0) return null;
  const avgGapMs = totalGap / count;
  if (avgGapMs <= 0) return null;
  const freqHz = 1000 / avgGapMs;
  if (freqHz >= BAND_THRESH.gamma) return 'gamma';
  if (freqHz >= BAND_THRESH.beta)  return 'beta';
  if (freqHz >= BAND_THRESH.alpha) return 'alpha';
  if (freqHz >= BAND_THRESH.theta) return 'theta';
  return 'delta';
}

// 譎る俣遯灘・縺ｫ逋ｺ轣ｫ縺励※縺・※縲∽ｺ偵＞縺ｫ騾｣邨舌＠縺ｦ縺・ｋ繝弱・繝臥ｾ､繧偵け繝ｩ繧ｹ繧ｿ蛹・
function detectSyncClusters() {
  const g = currentGraph();
  if (!g) return [];
  const now = Date.now();
  const activeIds = Object.keys(g.nodes).filter(id => {
    const n = g.nodes[id];
    return n.lastFired && (now - n.lastFired < SYNC_WINDOW_MS);
  });
  if (activeIds.length === 0) return [];

  // 髫｣謗･繝槭ャ繝・
  const adj = {};
  activeIds.forEach(id => adj[id] = []);
  g.edges.forEach(e => {
    if (adj[e.from] && activeIds.includes(e.to)) adj[e.from].push(e.to);
    if (adj[e.to] && activeIds.includes(e.from)) adj[e.to].push(e.from);
  });

  // 騾｣邨先・蛻・ｒ謗｢邏｢
  const visited = new Set();
  const clusters = [];
  activeIds.forEach(start => {
    if (visited.has(start)) return;
    const stack = [start];
    const comp = [];
    while (stack.length) {
      const cur = stack.pop();
      if (visited.has(cur)) continue;
      visited.add(cur);
      comp.push(cur);
      (adj[cur]||[]).forEach(nb => { if (!visited.has(nb)) stack.push(nb); });
    }
    if (comp.length === 0) return;

    // 蟶ｯ蝓溘ｒ螟壽焚豎ｺ縺ｧ豎ｺ螳・
    const bandCounts = {};
    let earliestFire = Infinity, latestFire = 0;
    comp.forEach(id => {
      const n = g.nodes[id];
      const band = estimateFreqBand(n) || 'delta';
      bandCounts[band] = (bandCounts[band]||0) + 1;
      earliestFire = Math.min(earliestFire, n.fireHistory[0] || n.lastFired);
      latestFire = Math.max(latestFire, n.lastFired);
    });
    const band = Object.entries(bandCounts).sort((a,b)=>b[1]-a[1])[0][0];
    const density = comp.length / activeIds.length;
    const durationMs = latestFire - earliestFire;

    clusters.push({ nodeIds: comp, band, density, durationMs, size: comp.length });
  });

  return clusters.filter(c => c.size >= 2); // 蜊倡峡繝弱・繝峨・繧ｯ繝ｩ繧ｹ繧ｿ縺ｨ縺ｿ縺ｪ縺輔↑縺・
}

/**
 * 同期したノード群から、新しい「組み合わせノード」を生成する。
 * 既存ノードを置き換えるのではなく、現在の流れから新しい構造を一つ生む。
 */
function generateEmergentNode(cluster) {
  const g = currentGraph();
  if (!g || !cluster || !cluster.nodeIds || cluster.nodeIds.length < 2) return null;
  const nodes = cluster.nodeIds
    .map(id => g.nodes[id])
    .filter(Boolean);
  if (nodes.length < 2) return null;
  // 同じ組み合わせを何度も生成しない
  const sourceIds = nodes.map(n => n.id).sort();
  const signature = sourceIds.join('|');
  if (!g.emergentSignatures) g.emergentSignatures = {};
  if (g.emergentSignatures[signature]) return null;
  // 既存ノードの内容から新しい概念の種を作る
  const labels = nodes
    .map(n => (n.label || '').trim())
    .filter(Boolean);
  if (labels.length < 2) return null;
  const id = uid();
  const centerX = nodes.reduce((sum, n) => sum + (n.x || 0), 0) / nodes.length;
  const centerY = nodes.reduce((sum, n) => sum + (n.y || 0), 0) / nodes.length;
  const label = labels.join(' × ').slice(0, 40);
  g.nodes[id] = {
    updatedAt: Date.now(),
    id,
    label,
    memo:
      'emergent: 同期したノードの組み合わせから生成\n' +
      labels.map((x, i) => `${i + 1}. ${x}`).join('\n'),
    x: centerX + (Math.random() - 0.5) * 80,
    y: centerY + (Math.random() - 0.5) * 80,
    weight: 4,
    color: '#F5C842',
    charge: 0,
    fireHistory: [],
    lastFired: 0,
    tags: ['emergent'],
    emergentFrom: sourceIds,
    emergentAt: Date.now()
  };
  // 「この新しいものが、何から生まれたか」を実グラフに残す
  sourceIds.forEach(sourceId => {
    if (!g.nodes[sourceId]) return;
    const exists = g.edges.some(e =>
      (e.from === sourceId && e.to === id) ||
      (e.from === id && e.to === sourceId)
    );
    if (!exists) {
      g.edges.push({
        from: sourceId,
        to: id,
        weight: 1,
        conductance: 1.0,
        emergent: true
      });
    }
  });
  g.emergentSignatures[signature] = id;
  return id;
}
function processEmergence() {
  const g = currentGraph();
  if (!g || !currentSyncClusters || currentSyncClusters.length === 0) return;
  // 最も大きな同期クラスタを、現在の「まとまり」として扱う
  const cluster = [...currentSyncClusters]
    .filter(c => c && c.nodeIds && c.nodeIds.length >= 2)
    .sort((a, b) => b.size - a.size)[0];
  if (!cluster) return;
  const id = generateEmergentNode(cluster);
  if (!id) return;
  saveGraphs();
  applyFlowchartLayout();
  updateScoreBar();
  // 生まれたもの自身を次のイベントの起点にする
  fireNode(id);
  showToast('新しい組み合わせが生まれました');
}
function updateAttractorState() {
  currentSyncClusters = detectSyncClusters();
  renderSyncClusterPanel();
  if (currentSyncClusters.length === 0) { currentAttractor = null; updateAttractorBar(); return; }
  // 譛螟ｧ繧ｯ繝ｩ繧ｹ繧ｿ繧剃ｻ｣陦ｨattractor縺ｨ縺励※謗｡逕ｨ
  const main = currentSyncClusters.sort((a,b)=>b.size-a.size)[0];
  currentAttractor = classifyAttractor(main);
  processEmergence();
  updateAttractorBar();
  scheduleEmotionBridgePush();
}

function renderBandLegend() {
  const el = document.getElementById('bandLegend');
  if (!el) return;
  el.innerHTML = Object.entries(BAND_STYLE).map(([key, style]) =>
    `<span style="display:flex;align-items:center;gap:3px;color:${style.color};white-space:nowrap;">
      <span style="width:6px;height:6px;border-radius:50%;background:${style.color};display:inline-block;"></span>${style.label}
    </span>`
  ).join('');
}

function renderSyncClusterPanel() {
  const list = document.getElementById('syncClusterList');
  if (!list) return;
  const g = currentGraph();
  if (!g || currentSyncClusters.length === 0) { list.innerHTML = ''; return; }
  list.innerHTML = currentSyncClusters.map(c => {
    const style = BAND_STYLE[c.band] || BAND_STYLE.delta;
    const names = c.nodeIds.map(id => g.nodes[id]?.label || '?').join('縲・);
    return `<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:rgba(0,0,0,0.55);border-radius:8px;margin-bottom:3px;font-size:11px;color:#fff;">
      <span style="width:7px;height:7px;border-radius:50%;background:${style.color};flex-shrink:0;"></span>
      <span style="color:${style.color};font-weight:600;white-space:nowrap;">${style.label}</span>
      <span style="opacity:0.85;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${names}</span>
      <span style="opacity:0.5;white-space:nowrap;">${Math.round(c.durationMs)}ms</span>
    </div>`;
  }).join('');
}

function updateAttractorBar() {
  const chip = document.getElementById('attractorChip');
  const dot  = document.getElementById('attractorDot');
  const text = document.getElementById('attractorText');
  if (!currentAttractor) { chip.classList.remove('show'); return; }
  chip.classList.add('show');
  chip.style.color = currentAttractor.color;
  chip.style.borderColor = currentAttractor.color + '55';
  chip.style.background = currentAttractor.color + '15';
  dot.style.background = currentAttractor.color;
  text.textContent = currentAttractor.label;
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// CANVAS RENDER
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function worldToScreen(wx, wy) {
  return { x: wx * vpScale + vpX, y: wy * vpScale + vpY };
}
function screenToWorld(sx, sy) {
  return { x: (sx - vpX) / vpScale, y: (sy - vpY) / vpScale };
}

function centerView() {
  const g = currentGraph();
  if (!g) return;
  const nids = Object.keys(g.nodes);
  if (nids.length === 0) { vpX = canvas.width/2; vpY = canvas.height/2; vpScale = 1; return; }
  let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
  nids.forEach(id => {
    const n = g.nodes[id];
    minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
    minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
  });
  const cx = (minX+maxX)/2, cy = (minY+maxY)/2;
  const margin = 120;
  const scaleX = (canvas.width - margin*2) / Math.max(maxX-minX, 1);
  const scaleY = (canvas.height - margin*2) / Math.max(maxY-minY, 1);
  vpScale = Math.min(Math.min(scaleX, scaleY), 1.2);
  vpX = canvas.width/2 - cx * vpScale;
  vpY = canvas.height/2 - cy * vpScale;
}

function drawArrow(x1, y1, x2, y2, color, weight, glow) {
  const dx = x2-x1, dy = y2-y1;
  const len = Math.sqrt(dx*dx+dy*dy);
  if (len < 1) return;
  const ux = dx/len, uy = dy/len;
  // 遏｢蜊ｰ縺ｮ蜈育ｫｯ繧偵ヮ繝ｼ繝臥ｫｯ縺ｾ縺ｧ邵ｮ繧√ｋ
  const r = NODE_R * vpScale;
  const ex = x2 - ux*r, ey = y2 - uy*r;
  const sx = x1 + ux*r, sy = y1 + uy*r;

  ctx.save();
  ctx.globalAlpha = glow ? 0.9 : 0.55;
  ctx.strokeStyle = color;
  ctx.lineWidth = (1 + weight * 0.7) * vpScale;
  ctx.lineCap = 'round';
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
  }
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  // 遏｢蜊ｰ繝倥ャ繝・
  const hs = 10 * vpScale;
  const angle = Math.atan2(ey-sy, ex-sx);
  ctx.fillStyle = color;
  ctx.shadowBlur = glow ? 8 : 0;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - hs*Math.cos(angle-0.4), ey - hs*Math.sin(angle-0.4));
  ctx.lineTo(ex - hs*Math.cos(angle+0.4), ey - hs*Math.sin(angle+0.4));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawEdgeWeight(x1, y1, x2, y2, w) {
  const mx = (x1+x2)/2, my = (y1+y2)/2;
  ctx.save();
  ctx.fillStyle = 'rgba(245,200,66,0.9)';
  ctx.font = `bold ${11*vpScale}px -apple-system`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`ﾃ・{w}`, mx, my - 10*vpScale);
  ctx.restore();
}

// 竭｡ 髮ｻ豬√′豬√ｌ縺ｦ縺・ｋ讒伜ｭ舌ｒ遉ｺ縺吶ヱ繝ｫ繧ｹ・医お繝・ず荳翫ｒ豬√ｌ繧句・轤ｹ・・
function drawCurrentPulse(x1, y1, x2, y2, charge, color) {
  if (charge < 0.05) return;
  const t = (Date.now() % 900) / 900;
  const px = x1 + (x2-x1) * t;
  const py = y1 + (y2-y1) * t;
  ctx.save();
  ctx.globalAlpha = Math.min(1, charge);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(px, py, 3.5 * vpScale, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawNode(n, id, score, phase) {
  const s = worldToScreen(n.x, n.y);
  const r = NODE_R * vpScale;
  const isSel = selectedNode === id;
  const isConnFrom = connectFrom === id;
  const glowAmt = score * (0.5 + 0.5 * Math.sin(phase + (n.x+n.y)*0.01));

  ctx.save();

  // 繧ｰ繝ｭ繝ｼ
  if (glowAmt > 0.3 || isSel || isConnFrom) {
    ctx.shadowColor = isConnFrom ? '#F5C842' : (isSel ? '#fff' : n.color || '#4A9EFF');
    ctx.shadowBlur = 8 + glowAmt * 24;
  }

  // 螟悶Μ繝ｳ繧ｰ・磯∈謚槭・謗･邯夲ｼ・
  if (isSel || isConnFrom) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, r + 5*vpScale, 0, Math.PI*2);
    ctx.strokeStyle = isConnFrom ? '#F5C842' : 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2*vpScale;
    ctx.stroke();
  }

  // 譛ｬ菴・
  const grad = ctx.createRadialGradient(s.x - r*0.3, s.y - r*0.3, r*0.1, s.x, s.y, r);
  const col = n.color || '#4A9EFF';
  grad.addColorStop(0, col + 'CC');
  grad.addColorStop(1, col + '55');
  ctx.beginPath();
  ctx.arc(s.x, s.y, r, 0, Math.PI*2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = col + 'AA';
  ctx.lineWidth = 1.5*vpScale;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 竭 髮ｻ闕ｷ繝ｪ繝ｳ繧ｰ・・harge驥上ｒ蜀・・縺ｮ蜈芽ｼｪ縺ｧ陦ｨ迴ｾ・・
  if (n.charge > 0.03) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, r * 0.7, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(255,255,255,${n.charge * 0.7})`;
    ctx.lineWidth = 2 * vpScale;
    ctx.stroke();
  }

  // 繧ｹ繧ｳ繧｢繝ｪ繝ｳ繧ｰ・磯㍾隕∝ｺｦ・・
  if (score > 0) {
    const pct = score;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r + 3*vpScale, -Math.PI/2, -Math.PI/2 + Math.PI*2*pct);
    ctx.strokeStyle = `rgba(245,200,66,${0.4 + pct*0.5})`;
    ctx.lineWidth = 3*vpScale;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // 繝ｩ繝吶Ν
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fs = Math.max(10, Math.min(14, 12)) * vpScale;
  ctx.font = `700 ${fs}px -apple-system`;
  const maxW = r * 1.6;
  const label = n.label || '?';
  // 謚倥ｊ霑斐＠
  const words = label.split('');
  const lineH = fs * 1.3;
  const lines = [];
  let cur = '';
  for (const ch of words) {
    if (ctx.measureText(cur+ch).width > maxW) { lines.push(cur); cur = ch; }
    else cur += ch;
  }
  if (cur) lines.push(cur);
  const totalH = lines.length * lineH;
  lines.forEach((line, i) => {
    ctx.fillText(line, s.x, s.y - totalH/2 + lineH*(i+0.5));
  });

  // 驥阪∩繝舌ャ繧ｸ
  const badge = `W${n.weight||3}`;
  ctx.font = `600 ${9*vpScale}px -apple-system`;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText(badge, s.x, s.y + r * 0.7);

  // 譛ｪ蜃ｦ逅・inbox)繝舌ャ繧ｸ 窶・莉悶い繝励Μ縺九ｉ蜿悶ｊ霎ｼ繧薙□縺ｾ縺ｾ譛ｪ遒ｺ隱阪・繝弱・繝峨↓陦ｨ遉ｺ
  if (n.triageStatus === 'inbox') {
    const bx = s.x + r * 0.72, by = s.y - r * 0.72, br = 8 * vpScale;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI*2);
    ctx.fillStyle = '#FF5F5F';
    ctx.fill();
    ctx.strokeStyle = 'rgba(13,15,20,0.9)';
    ctx.lineWidth = 1.5 * vpScale;
    ctx.stroke();
    ctx.font = `${10*vpScale}px -apple-system`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('踏', bx, by + 0.5*vpScale);
  }

  ctx.restore();
}

// 竭｢竭｣ 蜷梧悄繧ｯ繝ｩ繧ｹ繧ｿ縺ｮ豕｢邏九お繝輔ぉ繧ｯ繝茨ｼ夷ｳ豕｢鬚ｨ繝ｪ繝ｳ繧ｰ・俄・attractor縺ｮ蜿ｯ隕門喧
function drawSyncRipples(phase) {
  if (!currentSyncClusters.length) return;
  const g = currentGraph();
  if (!g) return;

  currentSyncClusters.forEach(cluster => {
    const style = BAND_STYLE[cluster.band] || BAND_STYLE.delta;
    // 繧ｯ繝ｩ繧ｹ繧ｿ縺ｮ驥榊ｿ・
    let cx = 0, cy = 0;
    cluster.nodeIds.forEach(id => {
      const n = g.nodes[id];
      cx += n.x; cy += n.y;
    });
    cx /= cluster.nodeIds.length; cy /= cluster.nodeIds.length;
    const center = worldToScreen(cx, cy);

    // 蜷・ヮ繝ｼ繝峨ｒ蛹・・豕｢邏九ｒ蛟句挨縺ｫ謠上￥
    cluster.nodeIds.forEach(id => {
      const n = g.nodes[id];
      const s = worldToScreen(n.x, n.y);
      const baseR = NODE_R * vpScale;
      for (let i = 0; i < 3; i++) {
        const ringPhase = (phase * style.speed * 3 + i * 0.9) % 3;
        const ringR = baseR + ringPhase * 22 * vpScale;
        const alpha = Math.max(0, 1 - ringPhase / 3) * 0.5 * cluster.density;
        if (alpha <= 0.01) continue;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = style.color;
        ctx.lineWidth = 1.6 * vpScale;
        ctx.beginPath();
        ctx.arc(s.x, s.y, ringR, 0, Math.PI*2);
        ctx.stroke();
        ctx.restore();
      }
    });

    // 繧ｯ繝ｩ繧ｹ繧ｿ蜈ｨ菴薙ｒ蝗ｲ繧阮・＞蟶ｯ蝓溘Λ繝吶Ν
    if (cluster.nodeIds.length >= 2 && vpScale > 0.4) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = style.color;
      ctx.font = `700 ${11*vpScale}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.fillText(style.label, center.x, center.y - NODE_R*vpScale - 26*vpScale);
      ctx.restore();
    }
  });
}

function render(now) {
  const dt = now ? (now - lastFrameTime) : 16;
  lastFrameTime = now || performance.now();

  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  glowPhase += 0.04;

  const g = currentGraph();
  if (!g) { animFrame = requestAnimationFrame(render); return; }

  // 竭 髮ｻ闕ｷ縺ｮ閾ｪ辟ｶ貂幄｡ｰ
  decayCharges(dt);

  const scores = computeScores();

  // Draw edges
  g.edges.forEach(e => {
    const from = g.nodes[e.from], to = g.nodes[e.to];
    if (!from || !to) return;
    ensureEdgePhysics(e);
    const fs = worldToScreen(from.x, from.y);
    const ts = worldToScreen(to.x, to.y);
    const isSel = selectedEdge && selectedEdge.from===e.from && selectedEdge.to===e.to;
    const col = isSel ? '#FF5F5F' : (from.color || '#4A9EFF');
    drawArrow(fs.x, fs.y, ts.x, ts.y, col, e.weight||1, isSel);
    if (vpScale > 0.5) drawEdgeWeight(fs.x, fs.y, ts.x, ts.y, e.weight||1);
    // 竭｡ 髮ｻ豬√ヱ繝ｫ繧ｹ・・rom縺ｫ髮ｻ闕ｷ縺御ｹ励▲縺ｦ縺・ｌ縺ｰ豬√ｌ縺ｦ隕九∴繧具ｼ・
    drawCurrentPulse(fs.x, fs.y, ts.x, ts.y, from.charge||0, col);
  });

  // 謗･邯壹Δ繝ｼ繝我ｸｭ縺ｮ繝励Ξ繝薙Η繝ｼ繝ｩ繧､繝ｳ
  if (mode === MODE.CONNECT && connectFrom && g.nodes[connectFrom]) {
    // drawn dynamically in pointermove 窶・skip here
  }

  // 竭｢竭｣ 蜷梧悄豕｢邏具ｼ医ヮ繝ｼ繝峨ｈ繧雁・縺ｫ謠上＞縺ｦ縲√ヮ繝ｼ繝峨′荳翫↓荵励ｋ繧医≧縺ｫ・・
  drawSyncRipples(glowPhase);

  // Draw nodes
  Object.entries(g.nodes).forEach(([id, n]) => {
    ensurePhysicsFields(n);
    drawNode(n, id, scores[id] || 0, glowPhase);
  });

  animFrame = requestAnimationFrame(render);
}

// attractor迥ｶ諷九・謠冗判繝ｫ繝ｼ繝励→縺ｯ蛻･縺ｮ霆ｽ縺・捉譛溘〒蜀崎ｨ育ｮ暦ｼ磯㍾縺・・逅・〒縺ｯ縺ｪ縺・′鬆ｻ蠎ｦ繧呈椛縺医ｋ・・
renderBandLegend();
setInterval(updateAttractorState, 500);

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// SCORE BAR
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function updateScoreBar() {
  const scores = computeScores();
  const g = currentGraph();
  if (!g) return;
  const sorted = Object.entries(scores)
    .filter(([id]) => g.nodes[id])
    .sort((a,b) => b[1]-a[1])
    .slice(0, 5);

  const bar = document.getElementById('scoreBar');
  bar.innerHTML = sorted.map(([id, sc]) => {
    const n = g.nodes[id];
    const pct = Math.round(sc * 100);
    const col = n.color || '#4A9EFF';
    return `<span class="score-chip" style="color:${col};border-color:${col}40;background:${col}18;">
      ${escHtml(n.label || '?')} ${pct}%
    </span>`;
  }).join('');
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// INPUT HANDLING
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function getPos(e) {
  const r = canvas.getBoundingClientRect();
  if (e.touches) {
    return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
  }
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function hitNode(sx, sy) {
  const g = currentGraph();
  if (!g) return null;
  const w = screenToWorld(sx, sy);
  const r = NODE_R;
  for (const [id, n] of Object.entries(g.nodes)) {
    const dx = n.x - w.x, dy = n.y - w.y;
    if (dx*dx + dy*dy < r*r) return id;
  }
  return null;
}

function hitEdge(sx, sy) {
  const g = currentGraph();
  if (!g) return null;
  const w = screenToWorld(sx, sy);
  const thresh = 18 / vpScale;
  for (const e of g.edges) {
    const fn = g.nodes[e.from], tn = g.nodes[e.to];
    if (!fn || !tn) continue;
    const dx = tn.x - fn.x, dy = tn.y - fn.y;
    const len = Math.sqrt(dx*dx+dy*dy);
    if (len < 1) continue;
    const t = Math.max(0, Math.min(1, ((w.x-fn.x)*dx+(w.y-fn.y)*dy)/(len*len)));
    const px = fn.x + t*dx - w.x, py = fn.y + t*dy - w.y;
    if (Math.sqrt(px*px+py*py) < thresh) return e;
  }
  return null;
}

// Pointer events
let pointerDown = false;
let pointerMoved = false;
let pointerStartPos = { x:0, y:0 };

canvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  pointerDown = true;
  pointerMoved = false;
  const pos = getPos(e);
  pointerStartPos = pos;

  const hitN = hitNode(pos.x, pos.y);

  if (mode === MODE.EDIT) {
    if (hitN) { selectedNode = hitN; }
    else {
      const hitE = hitEdge(pos.x, pos.y);
      if (hitE) { selectedEdge = hitE; showEdgeHint(hitE); }
      else { selectedNode = null; selectedEdge = null; }
    }
    document.getElementById('deleteNodeBtn').style.display = selectedNode ? '' : 'none';
  } else if (mode === MODE.CONNECT) {
    if (hitN) connectFrom = hitN;
  } else {
    // ADD mode・医ラ繝ｩ繝・げ遘ｻ蜍輔・辟｡蜉ｹ縲り・蜍輔Ξ繧､繧｢繧ｦ繝医′菴咲ｽｮ繧堤ｮ｡逅・☆繧九◆繧・ｼ・
    if (hitN) { selectedNode = hitN; }
  }
});

canvas.addEventListener('pointermove', e => {
  if (!pointerDown) return;
  const pos = getPos(e);
  const dx = pos.x - pointerStartPos.x, dy = pos.y - pointerStartPos.y;
  if (Math.sqrt(dx*dx+dy*dy) > 4) pointerMoved = true;

  if (dragging) {
    const w = screenToWorld(pos.x, pos.y);
    const g = currentGraph();
    if (g && g.nodes[dragging.nodeId]) {
      g.nodes[dragging.nodeId].x = w.x;
      g.nodes[dragging.nodeId].y = w.y;
      g.nodes[dragging.nodeId].updatedAt = Date.now();
    }
  } else if (!dragging && pointerMoved && !connectFrom) {
    // pan
    vpX += pos.x - (pointerStartPos.x + (pointerMoved ? 0 : dx));
    vpY += pos.y - (pointerStartPos.y + (pointerMoved ? 0 : dy));
    pointerStartPos = pos;
  }
});

canvas.addEventListener('pointerup', e => {
  if (!pointerDown) return;
  pointerDown = false;
  const pos = getPos(e);
  const hitN = hitNode(pos.x, pos.y);

  if (dragging) {
    saveGraphs();
    updateScoreBar();
    dragging = null;
    return;
  }

  if (!pointerMoved) {
    // TAP
    if (mode === MODE.ADD) {
      if (!hitN) {
        // 譁ｰ隕上ヮ繝ｼ繝芽ｿｽ蜉
        const w = screenToWorld(pos.x, pos.y);
        addNode(w.x, w.y);
      } else {
        // 竭 繧ｿ繝・・・晉匱轣ｫ・磯崕闕ｷ繧呈ｵ√☆・峨＠縺ｦ縺九ｉ繝弱・繝臥ｷｨ髮・ｒ髢九￥
        fireNode(hitN);
        openNodeSheet(hitN);
      }
    } else if (mode === MODE.CONNECT) {
      if (connectFrom && hitN && hitN !== connectFrom) {
        addEdge(connectFrom, hitN);
        connectFrom = null;
      } else if (hitN) {
        connectFrom = hitN;
        fireNode(hitN);
      } else {
        connectFrom = null;
      }
    } else if (mode === MODE.EDIT) {
      if (hitN) { fireNode(hitN); openNodeSheet(hitN); }
    }
  }
  dragging = null;
});

// Pinch zoom
let lastPinchDist = 0;
canvas.addEventListener('touchstart', e => {
  if (e.touches.length === 2) lastPinchDist = pinchDist(e);
}, { passive:true });
canvas.addEventListener('touchmove', e => {
  if (e.touches.length === 2) {
    const dist = pinchDist(e);
    const ratio = dist / lastPinchDist;
    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    vpX = cx - (cx - vpX) * ratio;
    vpY = cy - (cy - vpY) * ratio;
    vpScale = Math.max(0.3, Math.min(3, vpScale * ratio));
    lastPinchDist = dist;
    e.preventDefault();
  }
}, { passive:false });

function pinchDist(e) {
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(dx*dx+dy*dy);
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// NODE / EDGE OPERATIONS
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function addNode(wx, wy) {
  const g = currentGraph();
  if (!g) return;
  const id = uid();
  g.nodes[id] = {
    updatedAt: Date.now(),
    id, label:'譁ｰ縺励＞繝弱・繝・,
    x: wx, y: wy,
    weight: 3,
    color: '#4A9EFF',
    memo: '',
    charge: 0,
    fireHistory: [],
    lastFired: 0,
    tags: [],
  };
  applyFlowchartLayout();
  saveGraphs();
  updateScoreBar();
  openNodeSheet(id, true);
}

function addEdge(from, to) {
  const g = currentGraph();
  if (!g) return;
  // 驥崎､・メ繧ｧ繝・け
  if (g.edges.find(e => e.from===from && e.to===to)) { showToast('縺吶〒縺ｫ謗･邯壽ｸ医∩縺ｧ縺・); return; }
  g.edges.push({ from, to, weight:1, conductance:1.0 });
  if (g.deletedEdges) delete g.deletedEdges[from + '->' + to]; // 10 蜀肴磁邯壽凾縺ｯtombstone繧定ｧ｣髯､・医け繝ｩ繧ｦ繝峨・繝ｼ繧ｸ縺ｧ豸医∴縺ｪ縺・ｈ縺・↓・・
  applyFlowchartLayout();
  saveGraphs();
  updateScoreBar();
  showToast('謗･邯壹＠縺ｾ縺励◆');
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 繝・う繝ｪ繝ｼ繝弱・繝茨ｼ井ｻ頑律縺ｮ譌･莉倥ヮ繝ｼ繝峨ょ燕譌･繝弱・繝峨→閾ｪ蜍輔〒蝗譫懈磁邯壹☆繧具ｼ・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function todayDateStr() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function openOrCreateDailyNode() {
  const g = currentGraph();
  if (!g) return;
  const today = todayDateStr();

  // 譌｢縺ｫ莉頑律縺ｮ繝・う繝ｪ繝ｼ繝弱・繝医′縺ゅｌ縺ｰ縲√◎繧後ｒ髢九￥縺縺・
  const existingId = Object.keys(g.nodes).find(id => g.nodes[id].dailyNoteDate === today);
  if (existingId) {
    fireNode(existingId);
    openNodeSheet(existingId);
    return;
  }

  // 逶ｴ霑代・繝・う繝ｪ繝ｼ繝弱・繝茨ｼ井ｻ頑律繧医ｊ蜑阪〒譛譁ｰ縺ｮ繧ゅ・・峨ｒ謗｢縺励∝屏譫懊メ繧ｧ繝ｼ繝ｳ縺ｨ縺励※閾ｪ蜍墓磁邯・
  const dailyNodes = Object.entries(g.nodes)
    .filter(([, n]) => n.dailyNoteDate && n.dailyNoteDate < today)
    .sort((a, b) => b[1].dailyNoteDate.localeCompare(a[1].dailyNoteDate));
  const prevId = dailyNodes.length > 0 ? dailyNodes[0][0] : null;

  const basePos = prevId
    ? { x: g.nodes[prevId].x, y: g.nodes[prevId].y }
    : screenToWorld(canvas.width/2, canvas.height/2);

  const id = uid();
  g.nodes[id] = {
    updatedAt: Date.now(),
    id, label: today,
    x: basePos.x, y: basePos.y + 160,
    weight: 3,
    color: '#4A9EFF',
    memo: '',
    charge: 0,
    fireHistory: [],
    lastFired: 0,
    tags: ['繝・う繝ｪ繝ｼ'],
    dailyNoteDate: today,
  };
  if (prevId) g.edges.push({ from: prevId, to: id, weight: 1, conductance: 1.0 });

  applyFlowchartLayout();
  saveGraphs();
  updateScoreBar();
  centerView();
  fireNode(id);
  openNodeSheet(id, true);
  showToast(prevId ? '莉頑律縺ｮ繝弱・繝峨ｒ菴懈・縺励∝燕蝗槭→謗･邯壹＠縺ｾ縺励◆' : '莉頑律縺ｮ繝弱・繝峨ｒ菴懈・縺励∪縺励◆');
}

function deleteNode(id) {
  const g = currentGraph();
  if (!g) return;
  g.deletedNodeIds = g.deletedNodeIds || {};
  g.deletedNodeIds[id] = Date.now();
  delete g.nodes[id];
  g.edges = g.edges.filter(e => e.from!==id && e.to!==id);
  selectedNode = null;
  document.getElementById('deleteNodeBtn').style.display = 'none';
  applyFlowchartLayout();
  saveGraphs();
  updateScoreBar();
}

function deleteEdge(e) {
  const g = currentGraph();
  if (!g) return;
  g.deletedEdges = g.deletedEdges || {};
  g.deletedEdges[e.from + '->' + e.to] = Date.now();
  g.edges = g.edges.filter(x => !(x.from===e.from && x.to===e.to));
  selectedEdge = null;
  applyFlowchartLayout();
  saveGraphs();
  updateScoreBar();
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// NODE SHEET
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 繝ｩ繝吶Ν蛟呵｣懶ｼ域里蟄倥ヮ繝ｼ繝峨・繝ｩ繝吶Ν縺九ｉdatalist繧呈峩譁ｰ・・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function updateLabelSuggestions(excludeId) {
  const g = currentGraph();
  const datalist = document.getElementById('nLabelSuggestions');
  if (!g || !datalist) return;
  const labels = Array.from(new Set(
    Object.entries(g.nodes)
      .filter(([id]) => id !== excludeId)
      .map(([, n]) => n.label)
      .filter(Boolean)
  ));
  datalist.innerHTML = labels.map(l => `<option value="${escHtml(l)}"></option>`).join('');
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 繧ｳ繝斐・邉ｻ繝ｦ繝ｼ繝・ぅ繝ｪ繝・ぅ
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
async function copyTextToClipboard(text, successMsg) {
  if (!text) { showToast('繧ｳ繝斐・縺吶ｋ蜀・ｮｹ縺後≠繧翫∪縺帙ｓ'); return; }
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg || '繧ｳ繝斐・縺励∪縺励◆');
  } catch (e) {
    showToast('繧ｳ繝斐・縺ｫ螟ｱ謨励＠縺ｾ縺励◆(繝悶Λ繧ｦ繧ｶ縺ｮ讓ｩ髯舌ｒ遒ｺ隱阪＠縺ｦ縺上□縺輔＞)');
  }
}

function wireCopyButtons() {
  document.getElementById('nMemoCopyBtn')?.addEventListener('click', () => {
    copyTextToClipboard(document.getElementById('nMemo').value, '繝｡繝｢繧偵さ繝斐・縺励∪縺励◆');
  });
  document.getElementById('qcCopyBtn')?.addEventListener('click', () => {
    copyTextToClipboard(document.getElementById('qcInput').value, '繧ｳ繝斐・縺励∪縺励◆');
  });
  document.getElementById('aiResultCopyBtn')?.addEventListener('click', () => {
    copyTextToClipboard(document.getElementById('aiResultBox').textContent, 'AI蛻・梵邨先棡繧偵さ繝斐・縺励∪縺励◆');
  });
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 繧ｿ繧ｰ陦ｨ遉ｺ・医ヮ繝ｼ繝峨す繝ｼ繝亥・繝√ャ繝暦ｼ・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 繧ｿ繧ｰ蜷・萓・ '諢滓ュ-諤偵ｊ')繧定ｦｪ/蟄舌↓蛻・ｧ｣縺吶ｋ縲ゅワ繧､繝輔Φ縺檎┌縺代ｌ縺ｰ隕ｪ縺ｮ縺ｿ(蟄舌↑縺・縺ｨ縺励※謇ｱ縺・・
// D: 繧ｿ繧ｰ縺ｮ髫主ｱ､蛹・窶・TAG_KEYWORD_DICT縺ｮ繧ｭ繝ｼ蜻ｽ蜷崎ｦ丞援(隕ｪ-蟄・繧偵◎縺ｮ縺ｾ縺ｾ蛻ｩ逕ｨ縺吶ｋ霆ｽ驥丞ｮ溯｣・・
function splitTagHierarchy(tag) {
  const idx = tag.indexOf('-');
  if (idx === -1) return { parent: tag, child: null };
  return { parent: tag.slice(0, idx), child: tag.slice(idx + 1) };
}

function formatTagDisplay(tag) {
  const { parent, child } = splitTagHierarchy(tag);
  return child ? `${escHtml(parent)} / ${escHtml(child)}` : escHtml(parent);
}

function renderNodeTags(node) {
  const wrap = document.getElementById('nodeTagsWrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  (node.tags || []).forEach(tag => {
    const { parent, child } = splitTagHierarchy(tag);
    const chip = document.createElement('span');
    chip.style.cssText = 'background:var(--gold-dim);color:var(--gold);border-radius:100px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;display:inline-block;margin:0 6px 6px 0;';
    chip.innerHTML = child
      ? `<span class="tag-chip-parent">${escHtml(parent)}</span> <span class="tag-chip-child">${escHtml(child)}</span> 笨描
      : `<span class="tag-chip-child">${escHtml(parent)}</span> 笨描;
    chip.onclick = () => {
      node.tags = (node.tags || []).filter(t => t !== tag);
      node.updatedAt = Date.now();
      renderNodeTags(node);
      saveGraphs();
    };
    wrap.appendChild(chip);
  });
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 繝舌ャ繧ｯ繝ｪ繝ｳ繧ｯ繝代ロ繝ｫ・医け繝ｪ繝・け縺ｧ蜿ら・蜈医ヮ繝ｼ繝峨∈繧ｸ繝｣繝ｳ繝暦ｼ・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function renderBacklinkPanel(inEdges, outEdges, g) {
  const wrap = document.getElementById('edgeInfo');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (inEdges.length === 0 && outEdges.length === 0) {
    wrap.textContent = '縺ｪ縺・;
    return;
  }
  const makeRow = (arrow, targetId, weight) => {
    const row = document.createElement('div');
    row.style.cssText = 'padding:6px 0;cursor:pointer;color:var(--blue);';
    row.textContent = `${arrow} ${g.nodes[targetId]?.label || '?'} (ﾃ・{weight || 1})`;
    row.addEventListener('click', () => {
      if (g.nodes[targetId]) { fireNode(targetId); openNodeSheet(targetId); }
    });
    return row;
  };
  inEdges.forEach(e => wrap.appendChild(makeRow('竊・, e.from, e.weight)));
  outEdges.forEach(e => wrap.appendChild(makeRow('竊・, e.to, e.weight)));
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// A: 繧ｰ繝ｩ繝墓ｨｪ譁ｭ讀懃ｴ｢ / D: 繧ｿ繧ｰ髫主ｱ､繝悶Λ繧ｦ繧ｶ
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・

// 蜈ｨ繧ｰ繝ｩ繝輔ｒ讓ｪ譁ｭ縺励※繧ｿ繧ｰ縺斐→縺ｮ蜃ｺ迴ｾ莉ｶ謨ｰ繧帝寔險医☆繧・
function collectAllTagCounts() {
  const counts = {}; // tag -> count
  Object.values(graphs).forEach(g => {
    Object.values(g.nodes).forEach(n => {
      (n.tags || []).forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
  });
  return counts;
}

// 繧ｿ繧ｰ繧定ｦｪ縺斐→縺ｫ繧ｰ繝ｫ繝ｼ繝怜喧縺励※荳隕ｧ陦ｨ遉ｺ縲ょｭ舌ち繧ｰ繧偵ち繝・・縺吶ｋ縺ｨ縲√◎縺ｮ繧ｿ繧ｰ縺ｧ蜊ｳ讀懃ｴ｢縺吶ｋ縲・
function renderTagBrowser() {
  const wrap = document.getElementById('tagBrowserWrap');
  if (!wrap) return;
  const counts = collectAllTagCounts();
  const groups = {}; // parent -> [{tag, child, count}]
  Object.entries(counts).forEach(([tag, count]) => {
    const { parent, child } = splitTagHierarchy(tag);
    (groups[parent] = groups[parent] || []).push({ tag, child, count });
  });

  wrap.innerHTML = '';
  const parentNames = Object.keys(groups);
  if (parentNames.length === 0) {
    wrap.innerHTML = '<div class="search-empty">縺ｾ縺繧ｿ繧ｰ縺御ｻ倥＞縺溘ヮ繝ｼ繝峨′縺ゅｊ縺ｾ縺帙ｓ</div>';
    return;
  }

  parentNames.sort((a, b) => a.localeCompare(b, 'ja')).forEach(parent => {
    const groupEl = document.createElement('div');
    groupEl.className = 'tag-browser-group';
    const title = document.createElement('div');
    title.className = 'tag-browser-parent';
    title.textContent = parent;
    groupEl.appendChild(title);

    const row = document.createElement('div');
    groups[parent]
      .sort((a, b) => (a.child || '').localeCompare(b.child || '', 'ja'))
      .forEach(({ tag, child, count }) => {
        const chip = document.createElement('span');
        chip.className = 'tag-browser-child';
        chip.innerHTML = `${escHtml(child || parent)} <span class="cnt">${count}</span>`;
        chip.addEventListener('click', () => {
          document.getElementById('searchInput').value = tag;
          runGlobalSearch(tag);
        });
        row.appendChild(chip);
      });
    groupEl.appendChild(row);
    wrap.appendChild(groupEl);
  });
}

// 蜈ｨ繧ｰ繝ｩ繝輔・繝弱・繝峨ｒ讓ｪ譁ｭ縺励※縲√Λ繝吶Ν繝ｻ繝｡繝｢繝ｻ繧ｿ繧ｰ縺ｫquery(驛ｨ蛻・ｸ閾ｴ繝ｻ螟ｧ蟆冗┌隕・繧呈､懃ｴ｢縺吶ｋ
function runGlobalSearch(rawQuery) {
  const wrap = document.getElementById('searchResultsWrap');
  if (!wrap) return;
  const query = (rawQuery || '').trim().toLowerCase();
  if (!query) { wrap.innerHTML = ''; return; }

  const results = [];
  Object.entries(graphs).forEach(([graphId, g]) => {
    Object.values(g.nodes).forEach(n => {
      const tags = n.tags || [];
      const haystack = [n.label || '', n.memo || '', ...tags].join(' ').toLowerCase();
      if (haystack.includes(query)) {
        results.push({ graphId, graphName: g.name || '辟｡鬘後・繧ｰ繝ｩ繝・, node: n });
      }
    });
  });

  wrap.innerHTML = '';
  if (results.length === 0) {
    wrap.innerHTML = '<div class="search-empty">隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆</div>';
    return;
  }

  results.slice(0, 100).forEach(({ graphId, graphName, node }) => {
    // 蝓九ａ霎ｼ縺ｿ繝斐ャ繧ｫ繝ｼ繝｢繝ｼ繝我ｸｭ縺ｯ縲∬・蛻・・霄ｫ繧貞呵｣懊°繧蛾勁螟悶☆繧・
    if (searchPickerCallback && graphId === currentGraphId && node.id === editingNodeId) return;
    const item = document.createElement('div');
    item.className = 'search-result-item';
    const snippet = (node.memo || '').slice(0, 60);
    const tagsHtml = (node.tags || []).map(t => `<span>${formatTagDisplay(t)}</span>`).join('');
    item.innerHTML =
      `<div class="search-result-graph">${escHtml(graphName)}</div>` +
      `<div class="search-result-label">${escHtml(node.label || '辟｡鬘・)}</div>` +
      (snippet ? `<div class="search-result-snippet">${escHtml(snippet)}</div>` : '') +
      (tagsHtml ? `<div class="search-result-tags">${tagsHtml}</div>` : '');
    item.addEventListener('click', () => {
      if (searchPickerCallback) {
        const cb = searchPickerCallback;
        searchPickerCallback = null;
        closeSheet('searchSheet');
        cb(graphId, node.id);
        return;
      }
      closeSheet('searchSheet');
      const needSwitch = graphId !== currentGraphId;
      if (needSwitch) switchGraph(graphId);
      setTimeout(() => {
        fireNode(node.id);
        openNodeSheet(node.id);
      }, needSwitch ? 150 : 0);
    });
    wrap.appendChild(item);
  });
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// E: 繧ｰ繝ｩ繝暮俣縺ｮ蝓九ａ霎ｼ縺ｿ・井ｻ悶げ繝ｩ繝輔・繝弱・繝峨ｒ繝溘Λ繝ｼ蜿ら・縺吶ｋ・・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
let searchPickerCallback = null; // null=騾壼ｸｸ縺ｮ讀懃ｴ｢縲・未謨ｰ縺後そ繝・ヨ縺輔ｌ縺ｦ縺・ｌ縺ｰ繝斐ャ繧ｫ繝ｼ繝｢繝ｼ繝・

function openSearchPicker(callback) {
  searchPickerCallback = callback;
  renderTagBrowser();
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResultsWrap').innerHTML = '';
  document.getElementById('searchSheetTitle').textContent = '蝓九ａ霎ｼ繧繝弱・繝峨ｒ驕ｸ謚・;
  openSheet('searchSheet');
  setTimeout(() => document.getElementById('searchInput').focus(), 300);
}

function renderEmbeds(node) {
  const wrap = document.getElementById('embedWrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  const embeds = node.embeds || [];
  if (embeds.length === 0) return;

  embeds.forEach((ref, idx) => {
    const targetGraph = graphs[ref.graphId];
    const targetNode = targetGraph?.nodes[ref.nodeId];
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.style.position = 'relative';
    if (!targetNode) {
      item.innerHTML = `<div class="search-result-snippet">・亥盾辣ｧ蜈医′隕九▽縺九ｊ縺ｾ縺帙ｓ繝ｻ蜑企勁貂医∩縺ｮ蜿ｯ閭ｽ諤ｧ・・/div>`;
    } else {
      const snippet = (targetNode.memo || '').slice(0, 60);
      const tagsHtml = (targetNode.tags || []).map(t => `<span>${formatTagDisplay(t)}</span>`).join('');
      item.innerHTML =
        `<div class="search-result-graph">${escHtml(targetGraph.name || '辟｡鬘後・繧ｰ繝ｩ繝・)}</div>` +
        `<div class="search-result-label">${escHtml(targetNode.label || '辟｡鬘・)}</div>` +
        (snippet ? `<div class="search-result-snippet">${escHtml(snippet)}</div>` : '') +
        (tagsHtml ? `<div class="search-result-tags">${tagsHtml}</div>` : '');
      item.addEventListener('click', () => {
        const needSwitch = ref.graphId !== currentGraphId;
        if (needSwitch) switchGraph(ref.graphId);
        setTimeout(() => {
          fireNode(ref.nodeId);
          openNodeSheet(ref.nodeId);
        }, needSwitch ? 150 : 0);
      });
    }
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '笨・;
    removeBtn.style.cssText = 'position:absolute;top:8px;right:8px;background:none;border:none;color:var(--red);font-size:14px;font-weight:800;cursor:pointer;padding:4px;';
    removeBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      node.embeds.splice(idx, 1);
      saveGraphs();
      renderEmbeds(node);
    });
    item.appendChild(removeBtn);
    wrap.appendChild(item);
  });
}

function wireEmbeds() {
  document.getElementById('addEmbedBtn')?.addEventListener('click', () => {
    const g = currentGraph();
    const n = g?.nodes[editingNodeId];
    if (!n) return;
    openSearchPicker((graphId, nodeId) => {
      if (graphId === currentGraphId && nodeId === editingNodeId) return; // 閾ｪ蟾ｱ蜿ら・縺ｯ遖∵ｭ｢
      n.embeds = n.embeds || [];
      if (n.embeds.some(e => e.graphId === graphId && e.nodeId === nodeId)) {
        showToast('譌｢縺ｫ蝓九ａ霎ｼ縺ｿ貂医∩縺ｧ縺・);
      } else {
        n.embeds.push({ graphId, nodeId });
        saveGraphs();
        showToast('蝓九ａ霎ｼ縺ｿ縺ｾ縺励◆');
      }
      openNodeSheet(editingNodeId); // 繧ｷ繝ｼ繝医ｒ蜀肴緒逕ｻ縺励※蝓九ａ霎ｼ縺ｿ繧貞渚譏
    });
  });
}

function wireSearchSheet() {
  const btn = document.getElementById('searchBtn');
  const closeBtn = document.getElementById('searchSheetClose');
  const input = document.getElementById('searchInput');
  if (!btn || !closeBtn || !input) return;

  btn.addEventListener('click', () => {
    searchPickerCallback = null; // 騾壼ｸｸ繝懊ち繝ｳ縺九ｉ縺ｯ蟶ｸ縺ｫ騾壼ｸｸ繝｢繝ｼ繝峨〒髢九￥
    document.getElementById('searchSheetTitle').textContent = '讀懃ｴ｢';
    renderTagBrowser();
    input.value = '';
    document.getElementById('searchResultsWrap').innerHTML = '';
    openSheet('searchSheet');
    setTimeout(() => input.focus(), 300);
  });

  closeBtn.addEventListener('click', () => {
    searchPickerCallback = null; // 髢峨§縺溘ｉ繝斐ャ繧ｫ繝ｼ繝｢繝ｼ繝峨・蟶ｸ縺ｫ隗｣髯､
    closeSheet('searchSheet');
  });

  let searchTimer = null;
  input.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    const val = e.target.value;
    searchTimer = setTimeout(() => runGlobalSearch(val), 150);
  });
}

function openNodeSheet(id, isNew=false) {
  editingNodeId = id;
  const g = currentGraph();
  const n = g?.nodes[id];
  if (!n) return;
  ensurePhysicsFields(n);
  renderInboxBanner(n);

  document.getElementById('nodeSheetTitle').textContent = isNew ? '譁ｰ隕上ヮ繝ｼ繝・ : '繝弱・繝臥ｷｨ髮・;
  document.getElementById('nLabel').value = n.label || '';
  document.getElementById('nMemo').value = n.memo || '';
  updateLabelSuggestions(id);
  const slider = document.getElementById('nWeight');
  slider.value = n.weight || 3;
  document.getElementById('nWeightVal').textContent = n.weight || 3;
  updateSliderPct(slider);

  editingNodeColor = n.color || '#4A9EFF';
  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.classList.toggle('active', sw.dataset.color === editingNodeColor);
  });

  // 繧ｨ繝・ず諠・ｱ・医け繝ｪ繝・け縺ｧ蜿ら・蜈医ヮ繝ｼ繝峨∈繧ｸ繝｣繝ｳ繝暦ｼ昴ヰ繝・け繝ｪ繝ｳ繧ｯ蟆守ｷ夲ｼ・
  const inEdges  = g.edges.filter(e => e.to===id);
  const outEdges = g.edges.filter(e => e.from===id);
  renderBacklinkPanel(inEdges, outEdges, g);
  renderNodeTags(n);
  renderEmbeds(n);

  // 迚ｩ逅・ｱ､繧ｹ繝・・繧ｿ繧ｹ陦ｨ遉ｺ
  const band = estimateFreqBand(n);
  const bandLabel = band ? BAND_STYLE[band].label : '譛ｪ逋ｺ轣ｫ';
  const cluster = currentSyncClusters.find(c => c.nodeIds.includes(id));
  const attr = cluster ? classifyAttractor(cluster) : null;
  document.getElementById('physicsBox').innerHTML =
    `髮ｻ闕ｷ驥・ <b>${Math.round(n.charge*100)}%</b>縲逋ｺ轣ｫ蝗樊焚: <b>${n.fireHistory.length}</b><br>` +
    `謗ｨ螳壼ｸｯ蝓・ <b>${bandLabel}</b><br>` +
    `蜷梧悄attractor: <b>${attr ? attr.label : '譛ｪ蜿取據'}</b>`;

  openSheet('nodeSheet');
  setTimeout(() => {
    if (isNew) document.getElementById('nLabel').select();
  }, 300);
}

function saveNodeSheet() {
  const g = currentGraph();
  const n = g?.nodes[editingNodeId];
  if (!n) return;
  n.label  = document.getElementById('nLabel').value.trim() || '?';
  n.memo   = document.getElementById('nMemo').value;
  n.weight = parseInt(document.getElementById('nWeight').value);
  n.color  = editingNodeColor;
  n.tags   = extractTagsFromText(n.label, n.memo);
  n.updatedAt = Date.now();
  saveGraphs();
  updateScoreBar();
  closeSheet('nodeSheet');
  scheduleDriveKeepPush(n);
  pushNodeToEmotionBridge(n); // 菫晏ｭ倥・縺溘・縺ｫ縲√ヮ繝ｼ繝峨・蜀・ｮｹ縺昴・繧ゅ・繧呈─諠・ヶ繝ｪ繝・ず縺ｸ蜊ｳ譎Ｑush
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// EDGE HINT
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function showEdgeHint(e) {
  const g = currentGraph();
  const label = `${g?.nodes[e.from]?.label||'?'} 竊・${g?.nodes[e.to]?.label||'?'} (ﾃ・{e.weight||1}) 繧貞炎髯､縺励∪縺吶°・歔;
  document.getElementById('edgeHintLabel').textContent = label;
  document.getElementById('edgeHint').classList.add('show');
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// GRAPH LIST
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function renderGraphList() {
  const wrap = document.getElementById('graphListWrap');
  const ids = Object.keys(graphs).sort((a,b) => (graphs[b].createdAt||0)-(graphs[a].createdAt||0));
  wrap.innerHTML = ids.map(id => {
    const g = graphs[id];
    const nodeCount = Object.keys(g.nodes||{}).length;
    const isCur = id === currentGraphId;
    return `<div class="graph-item ${isCur?'current':''}" data-id="${id}">
      <div>
        <div class="graph-item-name">${escHtml(g.name)}${isCur?' 笨・:''}</div>
        <div class="graph-item-meta">繝弱・繝・${nodeCount}蛟・/div>
      </div>
      <button class="graph-item-del" data-del="${id}">卵</button>
    </div>`;
  }).join('') || '<div style="text-align:center;color:var(--text-dim);padding:30px;">繧ｰ繝ｩ繝輔′縺ゅｊ縺ｾ縺帙ｓ</div>';

  wrap.querySelectorAll('.graph-item[data-id]').forEach(el => {
    el.addEventListener('click', ev => {
      if (ev.target.dataset.del) return;
      switchGraph(el.dataset.id);
      closeSheet('graphsSheet');
    });
  });
  wrap.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.del;
      if (!confirm(`縲・{graphs[id]?.name}縲阪ｒ蜑企勁縺励∪縺吶°・歔)) return;
      delete graphs[id];
      if (currentGraphId === id) {
        const remaining = Object.keys(graphs);
        if (remaining.length === 0) createGraph('繧ｰ繝ｩ繝・');
        else switchGraph(remaining[0]);
      }
      saveGraphs();
      renderGraphList();
    });
  });
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// is_transfer 騾｣謳ｺ
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 繧｢繝励Μ蜷・竊・陦ｨ遉ｺ繝ｩ繝吶Ν・亥叙繧願ｾｼ縺ｿ蜈・ヰ繝翫・繝ｻ繧ｭ繝｣繝ｳ繝舌せ繝舌ャ繧ｸ縺ｧ菴ｿ縺・ｼ・
const SOURCE_APP_LABEL = {
  'quick-ref':    'quick-ref',
  'vocal-lab':    'vocal-lab',
  'score-editor': 'score-editor',
  'illust-studio':'illust-studio',
  'google-keep':  'Google Keep',
  'google-sheets':'Google繧ｹ繝励Ξ繝・ラ繧ｷ繝ｼ繝・,
  'crypto-vault': 'crypto-vault',
};

// 繧｢繧､繝・Β1莉ｶ繧偵∵─諠・Γ繧ｿ繝・・繧ｿ縺後≠繧後・縺昴ｌ繧貞渚譏縺励◆繝弱・繝峨→縺励※霑ｽ蜉縺吶ｋ蜈ｱ騾壼・逅・
// sourceApp: 蜻ｼ縺ｳ蜃ｺ縺怜・(importFromTransfer/checkEmotionTransfer)縺・payload.source 縺九ｉ譏守､ｺ逧・↓貂｡縺吶・
// 蠕捺擂縺ｯ item.source 繧定ｦ九※縺・◆縺後∝推繝悶Μ繝・ず縺ｯ payload逶ｴ荳九↓縺励° source 繧呈嶌縺崎ｾｼ縺ｾ縺ｪ縺・◆繧・
// 蟶ｸ縺ｫnull縺ｫ縺ｪ縺｣縺ｦ縺・◆荳榊・蜷医ｒ菫ｮ豁｣縲・
function addNodeFromTransferItem(item, index, total, g, sourceApp) {
  const angle = (index / total) * Math.PI * 2;
  const dist = 200 + Math.random() * 100;
  const id = item.id || uid();
  if (g.nodes[id]) return null;

  const meta = item._emotionMeta || null;
  const band = meta?.band || meta?.textBand || meta?.fmBand || null;
  const bandStyle = band ? BAND_STYLE[band] : null;
  const cols = ['#4A9EFF','#4AE09A','#F5C842','#C084FC','#FB923C','#FF5F5F'];
  const resolvedSource = sourceApp || item.source || null;

  g.nodes[id] = {
    updatedAt: Date.now(),
    id,
    label: (item.title || '辟｡鬘・).slice(0,20),
    memo: (item.body || '').replace(/<[^>]+>/g,'').slice(0,200),
    weight: 3,
    // 諢滓ュ繝｡繧ｿ縺後≠繧後・縺昴・蟶ｯ蝓溘・濶ｲ繧剃ｽｿ縺・ゅ↑縺代ｌ縺ｰ蠕捺擂騾壹ｊ陌ｹ濶ｲ繧貞牡繧雁ｽ薙※縲・
    color: bandStyle ? bandStyle.color : cols[index % cols.length],
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    charge: 0,
    fireHistory: [],
    lastFired: 0,
    sourceApp: resolvedSource || undefined,
    emotionBand: band || undefined,
    tags: extractTagsFromText(item.title, item.body),
    // 蜿悶ｊ霎ｼ縺ｿ逶ｴ蠕後・縲梧悴蜃ｦ逅・阪ゅΘ繝ｼ繧ｶ繝ｼ縺後ヮ繝ｼ繝臥ｷｨ髮・す繝ｼ繝医〒蜀・ｮｹ繧堤｢ｺ隱阪＠縲・
    // 縲悟叙繧願ｾｼ縺ｿ螳御ｺ・阪ｒ謚ｼ縺吶→ 'done' 縺ｫ縺ｪ繧九よ焔蜍戊ｿｽ蜉繝弱・繝峨↓縺ｯ縺薙・繝輔ぅ繝ｼ繝ｫ繝芽・菴薙′辟｡縺・・
    triageStatus: 'inbox',
  };
  return id;
}

// 迴ｾ蝨ｨ縺ｮ繧ｰ繝ｩ繝募・縺ｧ譛ｪ蜃ｦ逅・triageStatus==='inbox')縺ｮ繝弱・繝画焚繧呈焚縺医ｋ
function getInboxCount(g) {
  g = g || currentGraph();
  if (!g) return 0;
  return Object.values(g.nodes).filter(n => n.triageStatus === 'inbox').length;
}

// 繝倥ャ繝繝ｼ縺ｮ縲交沒・繧ｰ繝ｩ繝輔阪・繧ｿ繝ｳ縺ｫ譛ｪ蜃ｦ逅・ｻｶ謨ｰ繝舌ャ繧ｸ繧貞渚譏
function updateInboxBadge() {
  const badge = document.getElementById('inboxBadge');
  if (!badge) return;
  const count = getInboxCount();
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.classList.add('show');
  } else {
    badge.classList.remove('show');
  }
}

// 繝弱・繝峨ｒ縲悟叙繧願ｾｼ縺ｿ螳御ｺ・阪↓縺吶ｋ・医ヮ繝ｼ繝臥ｷｨ髮・す繝ｼ繝医・繝舌リ繝ｼ縺九ｉ蜻ｼ縺ｶ・・
function markNodeInboxDone(id) {
  const g = currentGraph();
  const n = g?.nodes[id];
  if (!n || n.triageStatus !== 'inbox') return;
  n.triageStatus = 'done';
  saveGraphs();
  updateInboxBadge();
  renderInboxBanner(n);
}

// 繝弱・繝臥ｷｨ髮・す繝ｼ繝医・蜿悶ｊ霎ｼ縺ｿ蜈・ヰ繝翫・陦ｨ遉ｺ繧呈峩譁ｰ
function renderInboxBanner(n) {
  const banner = document.getElementById('inboxBanner');
  const sourceEl = document.getElementById('inboxBannerSource');
  const btn = document.getElementById('inboxBannerBtn');
  if (!banner) return;
  if (!n.sourceApp && n.triageStatus !== 'inbox' && n.triageStatus !== 'done') {
    banner.classList.remove('show');
    return;
  }
  if (!n.triageStatus) { banner.classList.remove('show'); return; }
  banner.classList.add('show');
  sourceEl.textContent = SOURCE_APP_LABEL[n.sourceApp] || n.sourceApp || '莉悶い繝励Μ';
  if (n.triageStatus === 'inbox') {
    btn.textContent = '蜿悶ｊ霎ｼ縺ｿ螳御ｺ・;
    btn.classList.remove('done');
    btn.disabled = false;
  } else {
    btn.textContent = '笨・蜿悶ｊ霎ｼ縺ｿ貂医∩';
    btn.classList.add('done');
    btn.disabled = true;
  }
}

function importFromTransfer() {
  try {
    const raw = localStorage.getItem(LS_TRANSFER);
    if (!raw) { showToast('is_transfer縺ｫ繝・・繧ｿ縺後≠繧翫∪縺帙ｓ'); return; }
    const payload = JSON.parse(raw);
    const items = payload.items || (Array.isArray(payload) ? payload : null);
    if (!items || items.length === 0) { showToast('繧､繝ｳ繝昴・繝医〒縺阪ｋ繝・・繧ｿ縺後≠繧翫∪縺帙ｓ'); return; }

    const g = currentGraph();
    if (!g) return;

    let added = 0;
    items.forEach((item, i) => {
      const id = addNodeFromTransferItem(item, i, items.length, g, payload.source);
      if (id) { added++; fireNode(id); }
    });
    applyFlowchartLayout();
    saveGraphs();
    updateScoreBar();
    updateInboxBadge();
    centerView();
    closeSheet('graphsSheet');
    showToast(`${added}莉ｶ縺ｮ繝弱・繝峨ｒ霑ｽ蜉縺励∪縺励◆`);
  } catch(e) {
    console.error(e);
    showToast('繧､繝ｳ繝昴・繝医↓螟ｱ謨励＠縺ｾ縺励◆');
  }
}

// 笏笏 繝悶Μ繝・ず縺九ｉ縺ｮ閾ｪ蜍暮∽ｿ｡(is_emotion_transfer)繧帝撕縺九↓蜿悶ｊ霎ｼ繧 笏笏
// quick-ref-bridge遲峨′菫晏ｭ倥・縺溘・縺ｫ譖ｸ縺崎ｾｼ繧1莉ｶ繝・・繧ｿ繧偵∫｢ｺ隱阪↑縺励〒
// 蝗譫懊げ繝ｩ繝輔↓閾ｪ蜍戊ｿｽ蜉縺吶ｋ縲よ里縺ｫ蜿悶ｊ霎ｼ繧薙□繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励・險倬鹸縺励※驥崎､・亟豁｢縲・
let lastEmotionTransferTs = Number(localStorage.getItem('fm_last_emotion_ts') || 0);

function checkEmotionTransfer() {
  try {
    const raw = localStorage.getItem(LS_EMOTION_TRANSFER);
    if (!raw) return;
    const payload = JSON.parse(raw);
    if (!payload.timestamp || payload.timestamp <= lastEmotionTransferTs) return;
    if (payload.source === 'flow-mind') return; // 閾ｪ蛻・・霄ｫ縺ｮ譖ｸ縺崎ｾｼ縺ｿ縺ｯ辟｡隕・
    const items = payload.items;
    if (!Array.isArray(items) || items.length === 0) return;

    const g = currentGraph();
    if (!g) return;

    let added = 0, lastId = null;
    items.forEach((item, i) => {
      // 閾ｪ蜍募女菫｡縺ｧ縺ｯitem縺ｫ_emotionMeta縺檎┌縺・％縺ｨ縺後≠繧九・縺ｧ縲√・繧､繝ｭ繝ｼ繝牙・菴薙・emotionMeta縺ｧ陬懊≧
      const merged = item._emotionMeta ? item : { ...item, _emotionMeta: payload.emotionMeta };
      const id = addNodeFromTransferItem(merged, i, items.length, g, payload.source);
      if (id) { added++; lastId = id; }
    });
    if (added > 0) {
      applyFlowchartLayout();
      saveGraphs();
      updateScoreBar();
      updateInboxBadge();
      if (lastId) fireNode(lastId);
      showToast(`${payload.source || '莉悶い繝励Μ'}縺九ｉ${added}莉ｶ繧貞女菫｡縺励∪縺励◆`);
    }
    lastEmotionTransferTs = payload.timestamp;
    localStorage.setItem('fm_last_emotion_ts', String(lastEmotionTransferTs));
  } catch(e) {
    console.warn('checkEmotionTransfer error', e);
  }
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// #import= URL HASH
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function checkImportHash() {
  if (!location.hash.startsWith('#import=')) return;
  try {
    const b64 = location.hash.slice(8);
    const json = decodeURIComponent(escape(atob(b64)));
    const payload = JSON.parse(json);
    const name = payload.graphName || `繧､繝ｳ繝昴・繝・${new Date().toLocaleDateString()}`;
    const newId = createGraph(name);
    const g = graphs[newId];
    if (payload.nodes) g.nodes = payload.nodes;
    if (payload.edges) g.edges = payload.edges;
    applyFlowchartLayout();
    saveGraphs();
    switchGraph(newId);
    showToast(`繧ｰ繝ｩ繝輔・{name}縲阪ｒ繧､繝ｳ繝昴・繝医＠縺ｾ縺励◆`);
  } catch(e) { console.warn('hash import error', e); }
  finally { history.replaceState(null,'',location.pathname); }
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// AI LAYER
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
async function callAI(prompt) {
  const modelKey = localStorage.getItem(LS_MODEL) || 'claude';
  const proxyUrl = localStorage.getItem(LS_PROXY) || '';
  const m = MODELS[modelKey] || MODELS.claude;
  const keyMap = { claude:LS_CLAUDE, gemini:LS_GEMINI, openai:LS_OPENAI };
  const apiKey = localStorage.getItem(keyMap[modelKey]) || '';

  if (!apiKey && !proxyUrl) throw new Error(`API繧ｭ繝ｼ縺梧悴險ｭ螳壹〒縺吶Ｒuick-ref縺ｮ笞呻ｸ剰ｨｭ螳壹°繧牙・蜉帙＠縺ｦ縺上□縺輔＞・・{m.label}・荏);

  if (proxyUrl) {
    const res = await fetch(proxyUrl, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model:modelKey, prompt }),
    });
    if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
    const d = await res.json();
    return d.text || d.content || JSON.stringify(d);
  }

  if (modelKey === 'claude') {
    const res = await fetch(m.endpoint, {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':apiKey,
        'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body: JSON.stringify({ model:m.model, max_tokens:1024,
        messages:[{role:'user',content:prompt}] }),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || `Claude ${res.status}`);
    return d.content?.[0]?.text || '';
  }
  if (modelKey === 'gemini') {
    const res = await fetch(`${m.endpoint}?key=${apiKey}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ contents:[{parts:[{text:prompt}]}],
        generationConfig:{maxOutputTokens:1024} }),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || `Gemini ${res.status}`);
    return d.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  if (modelKey === 'openai') {
    const res = await fetch(m.endpoint, {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
      body: JSON.stringify({ model:m.model, max_tokens:1024,
        messages:[{role:'user',content:prompt}] }),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || `OpenAI ${res.status}`);
    return d.choices?.[0]?.message?.content || '';
  }
  throw new Error('譛ｪ蟇ｾ蠢懊・繝｢繝・Ν');
}

function buildGraphDescription() {
  const g = currentGraph();
  if (!g) return '';
  const scores = computeScores();
  const nodeLines = Object.entries(g.nodes)
    .sort((a,b) => (scores[b[0]]||0)-(scores[a[0]]||0))
    .map(([id,n]) => `繝ｻ${n.label}・郁・蟾ｱ驥阪∩:${n.weight}縲・㍾隕∝ｺｦ繧ｹ繧ｳ繧｢:${Math.round((scores[id]||0)*100)}%・・{n.memo?` 竊・${n.memo}`:''}`);
  const edgeLines = g.edges.map(e =>
    `${g.nodes[e.from]?.label||'?'} 竊端ﾃ・{e.weight||1}]竊・${g.nodes[e.to]?.label||'?'}`);
  return `繧ｰ繝ｩ繝募錐・・{g.name}\n\n縲舌ヮ繝ｼ繝峨曾n${nodeLines.join('\n')}\n\n縲仙屏譫懊お繝・ず縲曾n${edgeLines.join('\n')||'縺ｪ縺・}`;
}

// 竭｣ 蜷梧悄繧ｯ繝ｩ繧ｹ繧ｿ・拌ttractor諠・ｱ繧呈ｧ矩蛹悶＠縺ｦAI縺ｫ貂｡縺呻ｼ域悽髻ｳ謚ｽ蜃ｺ逕ｨ繧ｳ繝ｳ繝・く繧ｹ繝茨ｼ・
function buildAttractorContext() {
  const g = currentGraph();
  if (!g || currentSyncClusters.length === 0) {
    return '迴ｾ蝨ｨ縲∝酔譛溘＠縺ｦ縺・ｋ・域ｴｻ諤ｧ蛹悶＠縺ｦ縺・ｋ・峨ヮ繝ｼ繝臥ｾ､縺ｯ縺ゅｊ縺ｾ縺帙ｓ縲・;
  }
  const lines = currentSyncClusters.map(c => {
    const attr = classifyAttractor(c);
    const style = BAND_STYLE[c.band];
    const nodeLabels = c.nodeIds.map(id => g.nodes[id]?.label || '?').join('縲・);
    return `繝ｻ蟶ｯ蝓・${style.label}・乗戟邯・${Math.round(c.durationMs)}ms・丞ｯ・ｺｦ:${Math.round(c.density*100)}%\n` +
      `  髢｢荳弱ヮ繝ｼ繝・ ${nodeLabels}\n` +
      `  謗ｨ螳啾ttractor: ${attr ? attr.label : '譛ｪ蜿取據・磯℃貂｡迥ｶ諷具ｼ・}`;
  });
  return `迴ｾ蝨ｨ縲∽ｻ･荳九・逾樒ｵ悟酔譛溘ヱ繧ｿ繝ｼ繝ｳ・磯崕豌玲険蜍輔・繧ｯ繝ｩ繧ｹ繧ｿ・峨′讀懷・縺輔ｌ縺ｦ縺・∪縺呻ｼ喀n${lines.join('\n\n')}`;
}

async function runAnalysis(type, custom='') {
  const desc = buildGraphDescription();
  if (!desc.includes('繝弱・繝・)) { showToast('繝弱・繝峨ｒ霑ｽ蜉縺励※縺九ｉ蛻・梵縺励※縺上□縺輔＞'); return; }

  const attractorCtx = buildAttractorContext();

  const prompts = {
    structure: `莉･荳九・蝗譫懊げ繝ｩ繝輔ｒ蛻・梵縺励※縺上□縺輔＞縲・n譛驥崎ｦ√ヮ繝ｼ繝会ｼ亥ｽｱ髻ｿ蜉帙′螟ｧ縺阪＞繧ゅ・・峨・逅・罰縲∵ｧ矩逧・↑迚ｹ蠕ｴ縲∵隼蝟・署譯医ｒ譌･譛ｬ隱槭〒謨吶∴縺ｦ縺上□縺輔＞縲・n\n${desc}`,
    weak: `莉･荳九・蝗譫懊げ繝ｩ繝輔・蠑ｱ轤ｹ繧呈､懷・縺励※縺上□縺輔＞縲・n蟄､遶九＠縺溘ヮ繝ｼ繝峨∵ｹ諡縺ｮ阮・＞郢九′繧翫∬ｫ也炊逧・↑鬟幄ｺ阪∬ｦ玖誠縺ｨ縺輔ｌ縺ｦ縺・ｋ髢｢菫よｧ繧呈律譛ｬ隱槭〒謖・遭縺励※縺上□縺輔＞縲・n\n${desc}`,
    suggest: `莉･荳九・蝗譫懊げ繝ｩ繝輔ｒ隕九※縲∬ｿｽ蜉縺吶∋縺阪ヮ繝ｼ繝会ｼ域ｦょｿｵ繝ｻ繧｢繧､繝・い・峨ｒ5縺､謠先｡医＠縺ｦ縺上□縺輔＞縲・n蜷・署譯医↓縲∵里蟄倥・縺ｩ縺ｮ繝弱・繝峨→郢九′繧九°繧ら､ｺ縺励※縺上□縺輔＞縲よ律譛ｬ隱槭〒縲・n\n${desc}`,
    honne: `縺ゅ↑縺溘・縲梧─諠・・迚ｩ逅・Δ繝・Ν縲阪↓蝓ｺ縺･縺・※譛ｬ髻ｳ繧呈歓蜃ｺ縺吶ｋ繧｢繧ｷ繧ｹ繧ｿ繝ｳ繝医〒縺吶・n` +
      `諢滓ュ縺ｨ縺ｯ縲∫･樒ｵ後ロ繝・ヨ繝ｯ繝ｼ繧ｯ縺ｮ迚ｹ螳壹・蜻ｨ豕｢謨ｰ蟶ｯ縺ｧ縺ｮ蜷梧悄・医さ繝偵・繝ｬ繝ｳ繧ｹ・峨′縲∝ｮ牙ｮ壹＠縺溽憾諷具ｼ・ttractor・峨↓蜿取據縺励◆縺ｨ縺阪・荳ｻ隕ｳ逧・ｽ馴ｨ薙□縺ｨ閠・∴縺ｾ縺吶・n\n` +
      `${attractorCtx}\n\n` +
      `莉･荳九・縺薙・繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ諤晁・げ繝ｩ繝輔〒縺呻ｼ喀n${desc}\n\n` +
      `荳願ｨ倥・蜷梧悄繝代ち繝ｼ繝ｳ・育音縺ｫﾎｳ豕｢・晄偵ｊ繝ｻ髮・ｸｭ縲∃ｸ豕｢・昜ｸ榊ｮ峨∃ｴ豕｢・晄ｷｱ縺・ュ蜍包ｼ峨′縲～ +
      `縺ｩ縺ｮ繝弱・繝臥ｾ､繧剃ｸｭ蠢・↓襍ｷ縺阪※縺・ｋ縺九↓豕ｨ逶ｮ縺励√Θ繝ｼ繧ｶ繝ｼ閾ｪ霄ｫ繧ゅ∪縺險隱槫喧縺ｧ縺阪※縺・↑縺・梧悽髻ｳ縲阪ｒ譁ｭ螳壹○縺壻ｻｮ隱ｬ縺ｨ縺励※1縲・蛟九∵律譛ｬ隱槭〒謠千､ｺ縺励※縺上□縺輔＞縲Ａ +
      `譬ｹ諡縺ｨ縺励※縲√←縺ｮ蜷梧悄繧ｯ繝ｩ繧ｹ繧ｿ繝ｻ縺ｩ縺ｮ繝弱・繝峨・邨・∩蜷医ｏ縺帙°繧峨◎縺ｮ莉ｮ隱ｬ繧貞ｰ弱＞縺溘°繧よ・險倥＠縺ｦ縺上□縺輔＞縲Ａ,
  };

  const prompt = custom
    ? `${custom}\n\n---\n${attractorCtx}\n\n${desc}`
    : prompts[type];
  const box = document.getElementById('aiResultBox');
  const copyBtn = document.getElementById('aiResultCopyBtn');
  box.classList.remove('visible');
  copyBtn.style.display = 'none';
  document.getElementById('aiLoading').classList.add('show');

  try {
    const result = await callAI(prompt);
    box.textContent = result;
    box.classList.add('visible');
    copyBtn.style.display = '';
  } catch(e) {
    showToast(e.message);
  } finally {
    document.getElementById('aiLoading').classList.remove('show');
  }
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// AI荳諡ｬ繧ｿ繧ｰ蜀肴歓蜃ｺ
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function buildTagPrompt(nodeList) {
  return `莉･荳九・繝槭う繝ｳ繝峨・繝・・繧｢繝励Μ縺ｮ繝弱・繝我ｸ隕ｧ縺ｧ縺吶ょ推繝弱・繝峨↓縺､縺・※縲∝・螳ｹ繧定｡ｨ縺呎律譛ｬ隱槭ち繧ｰ繧・縲・蛟九★縺､莉倥￠縺ｦ縺上□縺輔＞縲・
繧ｿ繧ｰ縺ｯ譌｢蟄倥・隕ｳ轤ｹ・域─諠・・莉穂ｺ九・繧｢繧､繝・い繝ｻ莠ｺ髢馴未菫ゅ・霄ｫ菴薙↑縺ｩ・峨↓縺ｨ繧峨ｏ繧後★縲∝・螳ｹ縺ｫ蜊ｳ縺励※閾ｪ逕ｱ縺ｫ驕ｸ繧薙〒縺上□縺輔＞縲・
蜃ｺ蜉帙・蠢・★莉･荳九・JSON蠖｢蠑上・縺ｿ縺ｧ縲∬ｪｬ譏取枚繧・さ繝ｼ繝峨ヶ繝ｭ繝・け險伜捷縺ｯ荳蛻・性繧√↑縺・〒縺上□縺輔＞縲・

{"繧ｿ繧ｰ邨先棡": [{"id": "繝弱・繝迂D", "tags": ["繧ｿ繧ｰ1", "繧ｿ繧ｰ2"]}, ...]}

繝弱・繝我ｸ隕ｧ:
${nodeList.map(n => `- id:${n.id} label:${n.label} memo:${n.memo}`).join('\n')}`;
}

async function aiRetagAllNodes() {
  const g = currentGraph();
  if (!g) return;
  const nodeList = Object.entries(g.nodes).map(([id, n]) => ({ id, label: n.label, memo: n.memo || '' }));
  if (nodeList.length === 0) { showToast('繝弱・繝峨′縺ゅｊ縺ｾ縺帙ｓ'); return; }

  document.getElementById('aiLoading').classList.add('show');
  try {
    const prompt = buildTagPrompt(nodeList);
    const raw = await callAI(prompt);
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    parsed['繧ｿ繧ｰ邨先棡'].forEach(item => {
      if (g.nodes[item.id]) { g.nodes[item.id].tags = item.tags; g.nodes[item.id].updatedAt = Date.now(); }
    });
    saveGraphs();
    if (editingNodeId && g.nodes[editingNodeId]) renderNodeTags(g.nodes[editingNodeId]);
    showToast('捷 AI繧ｿ繧ｰ莉倥￠縺悟ｮ御ｺ・＠縺ｾ縺励◆');
  } catch (e) {
    showToast(e.message || '繧ｿ繧ｰ莉倥￠縺ｫ螟ｱ謨励＠縺ｾ縺励◆');
  } finally {
    document.getElementById('aiLoading').classList.remove('show');
  }
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// SHEET HELPERS
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function openSheet(id) {
  document.getElementById(id).classList.add('open');
  document.getElementById('overlay').classList.add('open');
}
function closeSheet(id) {
  document.getElementById(id).classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}
function closeAllSheets() {
  ['nodeSheet','aiSheet','graphsSheet'].forEach(id => {
    document.getElementById(id).classList.remove('open');
  });
  document.getElementById('overlay').classList.remove('open');
}

function setMode(m) {
  mode = m;
  connectFrom = null;
  document.getElementById('addModeBtn').classList.toggle('active', m===MODE.ADD);
  document.getElementById('connectModeBtn').classList.toggle('active', m===MODE.CONNECT);
  document.getElementById('editModeBtn').classList.toggle('active', m===MODE.EDIT);
  const labels = {
    add:'繧ｿ繝・・縺ｧ譁ｰ縺励＞繝弱・繝峨ｒ霑ｽ蜉 / 繝弱・繝峨ｒ繧ｿ繝・・縺ｧ邱ｨ髮・・逋ｺ轣ｫ',
    connect:'謗･邯壼・繝弱・繝峨ｒ繧ｿ繝・・ 竊・謗･邯壼・繧偵ち繝・・',
    edit:'繝弱・繝峨ｒ繧ｿ繝・・縺ｧ邱ｨ髮・/ 繧ｨ繝・ず繧偵ち繝・・縺ｧ蜑企勁・磯・鄂ｮ縺ｯ閾ｪ蜍墓紛蛻暦ｼ・,
  };
  document.getElementById('modeLabel').textContent = labels[m];
  document.getElementById('deleteNodeBtn').style.display = 'none';
  selectedNode = null; selectedEdge = null;
}

function updateSliderPct(slider) {
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.setProperty('--pct', pct + '%');
}

function escHtml(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2300);
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// QUICK CAPTURE 窶・縺吶＄險倬鹸・磯浹螢ｰ / 繝・く繧ｹ繝・/ 蜈ｱ譛峨す繝ｼ繝郁ｵｷ蜍包ｼ・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
let qcRecorder = null;
let qcChunks = [];
let qcRecording = false;

function openQuickCapture(prefillText) {
  document.getElementById('quickCaptureBar').classList.add('open');
  const input = document.getElementById('qcInput');
  if (typeof prefillText === 'string') input.value = prefillText;
  setQcStatus('');
  setTimeout(() => { input.focus(); autoGrowQc(); }, 150);
}

function closeQuickCapture() {
  document.getElementById('quickCaptureBar').classList.remove('open');
  if (qcRecording) stopQcRecording();
}

function autoGrowQc() {
  const el = document.getElementById('qcInput');
  el.style.height = 'auto';
  el.style.height = Math.min(120, el.scrollHeight) + 'px';
}

function setQcStatus(msg, busy) {
  const el = document.getElementById('qcStatus');
  el.textContent = msg || '';
  el.classList.toggle('busy', !!busy);
}

// 繝・く繧ｹ繝医°繧峨ヮ繝ｼ繝峨ｒ蜊ｳ譎ゆｽ懈・縺励∫峩蜑阪↓逋ｺ轣ｫ縺励◆繝弱・繝峨∈蝗譫懊お繝・ず縺ｧ謗･邯壹☆繧・
// ・茨ｼ晏ｭ､遶九ヮ繝ｼ繝峨↓縺帙★縲∵里蟄倥・諤晁・げ繝ｩ繝輔・荳ｭ縺ｫ菴咲ｽｮ縺･縺代ｋ・・
function quickAddNode(text) {
  const g = currentGraph();
  if (!g) return;
  const trimmed = text.trim();
  if (!trimmed) { showToast('蜀・ｮｹ繧貞・蜉帙＠縺ｦ縺上□縺輔＞'); return; }

  const connectSourceId = (lastFiredNodeId && g.nodes[lastFiredNodeId]) ? lastFiredNodeId : null;
  const basePos = connectSourceId
    ? { x: g.nodes[connectSourceId].x, y: g.nodes[connectSourceId].y }
    : screenToWorld(canvas.width/2, canvas.height/2);
  const angle = Math.random() * Math.PI * 2;
  const dist = 130 + Math.random() * 40;
  const pos = { x: basePos.x + Math.cos(angle)*dist, y: basePos.y + Math.sin(angle)*dist };

  const id = uid();
  const firstLine = trimmed.split('\n')[0].slice(0, 18);
  g.nodes[id] = {
    updatedAt: Date.now(),
    id,
    label: firstLine || '險倬鹸',
    memo: trimmed,                // 蜈ｨ譁・ｒ蠢・★繝｡繝｢縺ｫ菫晄戟・育怐逡･縺励↑縺・ｼ・
    x: pos.x, y: pos.y,
    weight: 3,
    color: '#4A9EFF',
    charge: 0,
    fireHistory: [],
    lastFired: 0,
    tags: extractTagsFromText(firstLine, trimmed),
  };
  // 逶ｴ蜑阪↓逋ｺ轣ｫ縺励◆繝弱・繝峨′縺ゅｌ縺ｰ縲∝屏譫懊・騾｣骼悶→縺励※閾ｪ蜍墓磁邯・
  if (connectSourceId) {
    g.edges.push({ from: connectSourceId, to: id, weight: 1, conductance: 1.0 });
  }

  applyFlowchartLayout();
  saveGraphs();
  updateScoreBar();
  closeQuickCapture();
  fireNode(id);                   // 逋ｺ轣ｫ縺輔○縺ｦ髮ｻ闕ｷ繝ｻ蜷梧悄豕｢繧剃ｼ晄眺縺輔○繧・
  scheduleDriveKeepPush(g.nodes[id]);
  document.getElementById('qcInput').value = '';
  autoGrowQc();

  // 蜈ｨ譁・・謗･邯壹ｒ遒ｺ隱阪〒縺阪ｋ繧医≧縲√ヮ繝ｼ繝臥ｷｨ髮・す繝ｼ繝医ｒ閾ｪ蜍輔〒髢九￥
  openNodeSheet(id, true);
  showToast(connectSourceId ? '險倬鹸縺励※謗･邯壹＠縺ｾ縺励◆' : '險倬鹸縺励∪縺励◆');
}

// 笏笏 髻ｳ螢ｰ蜈･蜉幢ｼ・ediaRecorder縺ｧ骭ｲ髻ｳ 竊・AI(Whisper邉ｻ)縺ｧ譁・ｭ苓ｵｷ縺薙＠・俄楳笏
// 陬懆ｶｳ・喨OS Safari縺ｯ繝悶Λ繧ｦ繧ｶ讓呎ｺ悶・髻ｳ螢ｰ隱崎ｭ・SpeechRecognition)縺ｫ蟇ｾ蠢懊＠縺ｦ縺・↑縺・◆繧√・
// 骭ｲ髻ｳ縺励※AI API縺ｫ騾√▲縺ｦ譁・ｭ苓ｵｷ縺薙＠縺吶ｋ譁ｹ蠑上↓縺励※縺・∪縺吶・
function startQcRecording() {
  if (qcRecording) return;
  if (!window.isSecureContext) {
    showToast('繝槭う繧ｯ縺ｯhttps迺ｰ蠅・〒縺ｮ縺ｿ菴ｿ逕ｨ縺ｧ縺阪∪縺・);
    return;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('縺薙・繝悶Λ繧ｦ繧ｶ/陦ｨ遉ｺ繝｢繝ｼ繝峨・骭ｲ髻ｳ縺ｫ蟇ｾ蠢懊＠縺ｦ縺・∪縺帙ｓ');
    return;
  }
  if (typeof MediaRecorder === 'undefined') {
    showToast('縺薙・迺ｰ蠅・・MediaRecorder縺ｫ蟇ｾ蠢懊＠縺ｦ縺・∪縺帙ｓ');
    return;
  }
  navigator.mediaDevices.getUserMedia({ audio:true }).then(stream => {
    qcChunks = [];
    const mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4'
      : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : '');
    try {
      qcRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    } catch (recErr) {
      console.error(recErr);
      showToast('骭ｲ髻ｳ縺ｮ蛻晄悄蛹悶↓螟ｱ謨励＠縺ｾ縺励◆: ' + recErr.message);
      stream.getTracks().forEach(t => t.stop());
      return;
    }
    qcRecorder.ondataavailable = e => { if (e.data.size > 0) qcChunks.push(e.data); };
    qcRecorder.onerror = e => {
      console.error('MediaRecorder error', e.error);
      showToast('骭ｲ髻ｳ繧ｨ繝ｩ繝ｼ: ' + (e.error?.message || e.error?.name || '荳肴・縺ｪ繧ｨ繝ｩ繝ｼ'));
    };
    qcRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      if (qcChunks.length === 0) { setQcStatus(''); showToast('骭ｲ髻ｳ繝・・繧ｿ縺悟叙蠕励〒縺阪∪縺帙ｓ縺ｧ縺励◆'); return; }
      const blob = new Blob(qcChunks, { type: qcRecorder.mimeType || 'audio/webm' });
      transcribeAndFill(blob);
    };
    qcRecorder.start();
    qcRecording = true;
    document.getElementById('qcMicBtn').classList.add('recording');
    document.getElementById('quickCaptureFab').classList.add('recording');
    setQcStatus('児 骭ｲ髻ｳ荳ｭ窶ｦ繧ゅ≧荳蠎ｦ繧ｿ繝・・縺ｧ譁・ｭ苓ｵｷ縺薙＠', true);
  }).catch(err => {
    console.error(err);
    // iOS縺ｧ繧医￥縺ゅｋ蜴溷屏繧貞愛蛻･縺励※繝｡繝・そ繝ｼ繧ｸ繧貞・縺怜・縺代ｋ
    let msg = '繝槭う繧ｯ縺ｸ縺ｮ繧｢繧ｯ繧ｻ繧ｹ縺悟ｿ・ｦ√〒縺・;
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      msg = '繝槭う繧ｯ縺ｸ縺ｮ繧｢繧ｯ繧ｻ繧ｹ縺梧拠蜷ｦ縺輔ｌ縺ｦ縺・∪縺吶りｨｭ螳・> Safari(縺ｾ縺溘・縺薙・繧｢繝励Μ) > 繝槭う繧ｯ 繧堤｢ｺ隱阪＠縺ｦ縺上□縺輔＞';
    } else if (err.name === 'NotFoundError') {
      msg = '繝槭う繧ｯ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ';
    } else if (err.name === 'NotReadableError') {
      msg = '莉悶・繧｢繝励Μ縺後・繧､繧ｯ繧剃ｽｿ逕ｨ荳ｭ縺ｮ蜿ｯ閭ｽ諤ｧ縺後≠繧翫∪縺・;
    } else if (err.name === 'SecurityError') {
      msg = '繧ｻ繧ｭ繝･繝ｪ繝・ぅ蛻ｶ髯舌↓繧医ｊ繝槭う繧ｯ繧剃ｽｿ逕ｨ縺ｧ縺阪∪縺帙ｓ(https迺ｰ蠅・°遒ｺ隱阪＠縺ｦ縺上□縺輔＞)';
    }
    showToast(msg + `・・{err.name}・荏);
  });
}

function stopQcRecording() {
  if (!qcRecording || !qcRecorder) return;
  qcRecording = false;
  document.getElementById('qcMicBtn').classList.remove('recording');
  document.getElementById('quickCaptureFab').classList.remove('recording');
  if (qcRecorder.state !== 'inactive') qcRecorder.stop();
}

async function transcribeAndFill(blob) {
  setQcStatus('竢ｳ 譁・ｭ苓ｵｷ縺薙＠荳ｭ窶ｦ', true);
  const apiKey = localStorage.getItem(LS_OPENAI) || '';
  const proxyUrl = localStorage.getItem(LS_PROXY) || '';
  if (!apiKey && !proxyUrl) {
    setQcStatus('');
    showToast('譁・ｭ苓ｵｷ縺薙＠縺ｫ縺ｯOpenAI API繧ｭ繝ｼ縺悟ｿ・ｦ√〒縺呻ｼ・uick-ref縺ｮ笞呻ｸ剰ｨｭ螳夲ｼ・);
    return;
  }
  try {
    let text = '';
    if (proxyUrl) {
      const form = new FormData();
      form.append('file', blob, 'audio.' + (blob.type.includes('mp4') ? 'mp4' : 'webm'));
      form.append('purpose', 'transcription');
      const res = await fetch(proxyUrl.replace(/\/$/, '') + '/transcribe', { method:'POST', body: form });
      if (!res.ok) throw new Error(`Proxy transcribe error: ${res.status}`);
      const d = await res.json();
      text = d.text || '';
    } else {
      const form = new FormData();
      form.append('file', blob, 'audio.' + (blob.type.includes('mp4') ? 'mp4' : 'webm'));
      form.append('model', 'whisper-1');
      form.append('language', 'ja');
      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method:'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: form,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message || `Whisper ${res.status}`);
      text = d.text || '';
    }
    const input = document.getElementById('qcInput');
    input.value = (input.value ? input.value + '\n' : '') + text.trim();
    autoGrowQc();
    setQcStatus('');
  } catch(e) {
    console.error(e);
    setQcStatus('');
    showToast('譁・ｭ苓ｵｷ縺薙＠縺ｫ螟ｱ謨励＠縺ｾ縺励◆: ' + e.message);
  }
}

// 笏笏 URL邨檎罰縺ｮ蜊ｳ險倬鹸蜿嶺ｿ｡ 笏笏
// index.html#capture=<encodeURIComponent(text)> 縺ｧ髢九￥縺ｨ縲√☆縺占ｨ倬鹸繝舌・縺ｫ繝・く繧ｹ繝医′蜈･縺｣縺溽憾諷九〒襍ｷ蜍輔☆繧九・
// &auto=1 繧剃ｻ倥￠繧九→繝舌・繧帝幕縺九★縺昴・縺ｾ縺ｾ繝弱・繝牙喧縺吶ｋ・井ｾ具ｼ喨OS繧ｷ繝ｧ繝ｼ繝医き繝・ヨ縺ｮ縲悟・譛峨阪い繧ｯ繧ｷ繝ｧ繝ｳ縺九ｉ・峨・
function checkCaptureHash() {
  if (!location.hash.startsWith('#capture=')) return;
  try {
    const raw = location.hash.slice('#capture='.length);
    const [encoded, ...rest] = raw.split('&');
    const text = decodeURIComponent(encoded);
    const auto = rest.includes('auto=1');
    if (auto && text.trim()) {
      quickAddNode(text);
    } else {
      openQuickCapture(text);
    }
  } catch(e) { console.warn('capture hash parse error', e); }
  finally { history.replaceState(null, '', location.pathname); }
}

function wireQuickCapture() {
  const fab = document.getElementById('quickCaptureFab');
  const bar = document.getElementById('quickCaptureBar');
  const input = document.getElementById('qcInput');
  const micBtn = document.getElementById('qcMicBtn');
  const sendBtn = document.getElementById('qcSendBtn');
  const closeBtn = document.getElementById('qcCloseBtn');

  // FAB縺ｯ繧ｿ繝・・縺ｧ繝舌・繧帝幕縺上□縺托ｼ磯鹸髻ｳ縺ｯ繝槭う繧ｯ繝懊ち繝ｳ繧堤峩謗･繧ｿ繝・・縺励◆譎ゅ□縺鷹幕蟋九☆繧九・
  // iOS縺ｯgetUserMedia繧偵Θ繝ｼ繧ｶ繝ｼ謫堺ｽ懊・窶懃峩謗･縺ｮ邨先棡窶昴→縺励※縺ｧ縺ｪ縺・→險ｱ蜿ｯ縺励↑縺・◆繧√・
  // setTimeout繧呈検繧髟ｷ謚ｼ縺苓ｵｷ蜍輔・菴ｿ繧上↑縺・ｼ・
  fab.addEventListener('click', () => openQuickCapture());

  closeBtn.addEventListener('click', closeQuickCapture);

  input.addEventListener('input', autoGrowQc);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      quickAddNode(input.value);
    }
  });

  micBtn.addEventListener('click', () => {
    if (qcRecording) stopQcRecording();
    else startQcRecording();
  });

  sendBtn.addEventListener('click', () => quickAddNode(input.value));
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// SYNC 窶・Windows(File System Access API) / iPhone(謇句虚Files騾｣謳ｺ)
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// SYNC 窶・Windows(File System Access API) / iPhone(謇句虚Files騾｣謳ｺ) / 繧ｯ繝ｩ繧ｦ繝・蜈ｨ遶ｯ譛ｫ蜈ｱ騾・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function mergeCloudGraphs(local, remote) {
  const merged = structuredClone(local || {});
  const remoteGraphs = remote || {};

  for (const [graphId, rg] of Object.entries(remoteGraphs)) {
    const lg = merged[graphId];

    if (!lg) {
      merged[graphId] = structuredClone(rg);
      continue;
    }

    const lGraphTs = lg.updatedAt || 0;
    const rGraphTs = rg.updatedAt || 0;

    if (rGraphTs > lGraphTs) {
      merged[graphId] = structuredClone(rg);
      continue;
    }

    const nodes = {};
    const localNodes = lg.nodes || {};
    const remoteNodes = rg.nodes || {};

    for (const nodeId of new Set([...Object.keys(localNodes), ...Object.keys(remoteNodes)])) {
      const ln = localNodes[nodeId];
      const rn = remoteNodes[nodeId];

      if (!ln) {
        nodes[nodeId] = structuredClone(rn);
      } else if (!rn) {
        nodes[nodeId] = structuredClone(ln);
      } else {
        nodes[nodeId] = structuredClone((rn.updatedAt || 0) > (ln.updatedAt || 0) ? rn : ln);
      }
    }

    const deletedNodeIds = {};
    for (const key of new Set([...Object.keys(lg.deletedNodeIds || {}), ...Object.keys(rg.deletedNodeIds || {})])) {
      deletedNodeIds[key] = Math.max((lg.deletedNodeIds || {})[key] || 0, (rg.deletedNodeIds || {})[key] || 0);
    }

    for (const [nodeId, deletedAt] of Object.entries(deletedNodeIds)) {
      if ((nodes[nodeId]?.updatedAt || 0) <= deletedAt) {
        delete nodes[nodeId];
      }
    }

    const edgeMap = new Map();
    for (const e of [...(lg.edges || []), ...(rg.edges || [])]) {
      const key = e.from + '->' + e.to;
      if (!edgeMap.has(key)) edgeMap.set(key, structuredClone(e));
    }

    const deletedEdges = {};
    for (const key of new Set([...Object.keys(lg.deletedEdges || {}), ...Object.keys(rg.deletedEdges || {})])) {
      deletedEdges[key] = Math.max((lg.deletedEdges || {})[key] || 0, (rg.deletedEdges || {})[key] || 0);
    }

    const edges = [...edgeMap.entries()]
      .filter(([key]) => {
        const deletedAt = deletedEdges[key] || 0;
        return deletedAt === 0;
      })
      .map(([, e]) => e)
      .filter(e => nodes[e.from] && nodes[e.to]);

    merged[graphId] = {
      ...structuredClone(lg),
      ...structuredClone(rg),
      nodes,
      edges,
      deletedNodeIds,
      deletedEdges,
      updatedAt: Math.max(lGraphTs, rGraphTs)
    };
  }

  return merged;
}

async function checkCloudSyncOnLoad() {
  if (!window.CloudSync || !CloudSync.isConfigured()) return;
  try {
    const payload = await CloudSync.cloudLoad('flow-mind');
    if (!payload || !payload.data) return;

    const merged = mergeCloudGraphs(graphs, payload.data);
    graphs = merged;

    const ids = Object.keys(graphs);
    if (!graphs[currentGraphId]) {
      currentGraphId = ids[0] || null;
      if (!currentGraphId) createGraph('縺ｯ縺倥ａ縺ｦ縺ｮ繧ｰ繝ｩ繝・);
      else localStorage.setItem(LS_CURRENT, currentGraphId);
    }

    localStorage.setItem(LS_GRAPHS, JSON.stringify(graphs));
    if (payload.timestamp) {
      CloudSync.setLastSyncedAt('flow-mind', payload.timestamp);
    }
    // 繝槭・繧ｸ邨先棡繧偵し繝ｼ繝舌・縺ｫ繧よ嶌縺肴綾縺呻ｼ井ｻ也ｫｯ譛ｫ縺ｮ螟画峩縺梧ｶ医∴縺ｪ縺・ｈ縺・↓縺吶ｋ縺溘ａ・・
    CloudSync.cloudSave('flow-mind', graphs);

    applyFlowchartLayout();
    centerView();
    updateScoreBar();
  } catch(e) { console.warn('checkCloudSyncOnLoad error', e); }
}

async function checkCloudSyncOnResume() {
  if (!window.CloudSync || !CloudSync.isConfigured()) return;
  try {
    const payload = await CloudSync.cloudLoad('flow-mind');
    if (!payload || !payload.data) return;

    const merged = mergeCloudGraphs(graphs, payload.data);
    graphs = merged;

    const ids = Object.keys(graphs);
    if (!graphs[currentGraphId]) {
      currentGraphId = ids[0] || null;
      if (!currentGraphId) createGraph('縺ｯ縺倥ａ縺ｦ縺ｮ繧ｰ繝ｩ繝・);
      else localStorage.setItem(LS_CURRENT, currentGraphId);
    }

    localStorage.setItem(LS_GRAPHS, JSON.stringify(graphs));
    if (payload.timestamp) {
      CloudSync.setLastSyncedAt('flow-mind', payload.timestamp);
    }
    // 繝槭・繧ｸ邨先棡繧偵し繝ｼ繝舌・縺ｫ繧よ嶌縺肴綾縺呻ｼ井ｻ也ｫｯ譛ｫ縺ｮ螟画峩縺梧ｶ医∴縺ｪ縺・ｈ縺・↓縺吶ｋ縺溘ａ・・
    CloudSync.cloudSave('flow-mind', graphs);

    updateScoreBar();
  } catch(e) { console.warn('checkCloudSyncOnResume error', e); }
}

async function refreshCloudSyncStatus() {
  if (!window.CloudSync) return;
  const c = CloudSync.getConfig();
  document.getElementById('cloudEndpointInput').value = c.endpoint || '';
  document.getElementById('cloudTokenInput').value = c.token || '';
  if (!CloudSync.isConfigured()) {
    document.getElementById('cloudSyncStatus').textContent = '譛ｪ險ｭ螳・;
    return;
  }
  const ts = CloudSync.getLastSyncedAt('flow-mind');
  document.getElementById('cloudSyncStatus').textContent = ts
    ? `險ｭ螳壽ｸ医∩ / 譛邨ょ酔譛・ ${new Date(ts).toLocaleString('ja-JP')}`
    : '險ｭ螳壽ｸ医∩・医∪縺譛ｪ蜷梧悄・・;
}

function wireCloudSync() {
  document.getElementById('cloudSaveConfigBtn').addEventListener('click', async () => {
    if (!window.CloudSync) { showToast('cloud-sync.js縺瑚ｪｭ縺ｿ霎ｼ縺ｾ繧後※縺・∪縺帙ｓ'); return; }
    const endpoint = document.getElementById('cloudEndpointInput').value;
    const token = document.getElementById('cloudTokenInput').value;
    CloudSync.setConfig(endpoint, token);
    showToast('險ｭ螳壹ｒ菫晏ｭ倥＠縺ｾ縺励◆');
    await checkCloudSyncOnLoad();
    CloudSync.cloudSave('flow-mind', graphs); // 險ｭ螳夂峩蠕後↓荳蠎ｦ譖ｸ縺崎ｾｼ繧薙〒縺翫￥
    refreshCloudSyncStatus();
  });

  document.getElementById('cloudSyncNowBtn').addEventListener('click', async () => {
    if (!window.CloudSync || !CloudSync.isConfigured()) { showToast('蜈医↓繧ｨ繝ｳ繝峨・繧､繝ｳ繝・繝医・繧ｯ繝ｳ繧定ｨｭ螳壹＠縺ｦ縺上□縺輔＞'); return; }
    CloudSync.cloudSave('flow-mind', graphs);
    showToast('蜷梧悄縺励∪縺励◆');
    setTimeout(refreshCloudSyncStatus, 1400);
  });
}

async function checkCloudOnLoad() {
  if (!window.SyncBridge || !SyncBridge.isDesktopCapable()) return;
  try {
    const connected = await SyncBridge.isConnected('flow-mind');
    if (!connected) return;
    const payload = await SyncBridge.autoLoad('flow-mind');
    if (!payload || !payload.data) return;
    const localLastSync = SyncBridge.getLastSyncedAt('flow-mind') || 0;
    if (payload.timestamp > localLastSync) {
      const when = new Date(payload.timestamp).toLocaleString('ja-JP');
      if (confirm(`iCloud蛛ｴ縺ｫ譁ｰ縺励＞繝・・繧ｿ縺後≠繧翫∪縺・${when})縲りｪｭ縺ｿ霎ｼ縺ｿ縺ｾ縺吶°・歃n・育樟蝨ｨ縺ｮ繧ｰ繝ｩ繝輔・荳頑嶌縺阪＆繧後∪縺呻ｼ荏)) {
        graphs = payload.data;
        const ids = Object.keys(graphs);
        if (!graphs[currentGraphId]) {
          currentGraphId = ids[0] || null;
          if (!currentGraphId) createGraph('縺ｯ縺倥ａ縺ｦ縺ｮ繧ｰ繝ｩ繝・);
          else localStorage.setItem(LS_CURRENT, currentGraphId);
        }
        applyFlowchartLayout();
        saveGraphs();
        centerView();
        updateScoreBar();
        showToast('iCloud縺九ｉ隱ｭ縺ｿ霎ｼ縺ｿ縺ｾ縺励◆');
      }
    }
  } catch(e) { console.warn('checkCloudOnLoad error', e); }
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// GOOGLE KEEP 謫ｬ莨ｼ蜷梧悄・・oogle Drive邨檎罰・・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 1繝弱・繝会ｼ・JSON繝輔ぃ繧､繝ｫ縺ｨ縺励※Drive荳翫↓菫晏ｭ倥・蜿門ｾ励☆繧九・eep譛ｬ菴薙↓縺ｯ隗ｦ繧後↑縺・・
// emotion-bridge(is_transfer/is_emotion_transfer)縺ｨ縺ｯ螳悟・縺ｫ迢ｬ遶九＠縺滉ｻ慕ｵ・∩縲・
const DRIVE_KEEP_KNOWN_IDS_KEY = 'fm_drive_keep_known_ids';

function driveKeepKnownFileIds() {
  const g = currentGraph();
  const fromNodes = g ? Object.values(g.nodes).map(n => n.driveFileId).filter(Boolean) : [];
  let stored = [];
  try { stored = JSON.parse(localStorage.getItem(DRIVE_KEEP_KNOWN_IDS_KEY) || '[]'); } catch(e) {}
  return Array.from(new Set([...fromNodes, ...stored]));
}

function rememberDriveKeepFileId(fileId) {
  const ids = driveKeepKnownFileIds();
  if (!ids.includes(fileId)) ids.push(fileId);
  try { localStorage.setItem(DRIVE_KEEP_KNOWN_IDS_KEY, JSON.stringify(ids)); } catch(e) {}
}

// 繝弱・繝芽ｿｽ蜉繝ｻ邱ｨ髮・・縺溘・縺ｫ蜻ｼ縺ｶ縲りｪ榊庄貂医∩縺ｧ縺ｪ縺代ｌ縺ｰ菴輔ｂ縺励↑縺・繧ｵ繧､繝ｬ繝ｳ繝医↓辟｡隕・
let driveKeepPushTimer = null;
function scheduleDriveKeepPush(node) {
  if (!node || !window.DriveKeepSync || !DriveKeepSync.isAuthorized()) return;
  clearTimeout(driveKeepPushTimer);
  driveKeepPushTimer = setTimeout(async () => {
    try {
      const fileId = await DriveKeepSync.pushNode(node);
      if (fileId && node.driveFileId !== fileId) {
        node.driveFileId = fileId;
        rememberDriveKeepFileId(fileId);
        saveGraphs();
      }
    } catch (e) {
      console.warn('[drive-keep-sync] push failed', e);
    }
  }, 800);
}

async function pullDriveKeepNotes() {
  if (!window.DriveKeepSync || !DriveKeepSync.isAuthorized()) return;
  const g = currentGraph();
  if (!g) return;
  try {
    const items = await DriveKeepSync.pullNewNotes(driveKeepKnownFileIds());
    if (!items.length) return;

    let added = 0, lastId = null;
    items.forEach((item, i) => {
      const transferItem = { title: item.title, body: item.body, source: 'google-keep' };
      const id = addNodeFromTransferItem(transferItem, i, items.length, g);
      if (id) {
        g.nodes[id].driveFileId = item.fileId;
        g.nodes[id].sourceApp = 'google-keep';
        rememberDriveKeepFileId(item.fileId);
        added++; lastId = id;
      }
    });
    if (added > 0) {
      applyFlowchartLayout();
      saveGraphs();
      updateScoreBar();
      if (lastId) fireNode(lastId);
      showToast(`Google Keep縺九ｉ${added}莉ｶ繧貞女菫｡縺励∪縺励◆`);
    }
  } catch (e) {
    console.warn('[drive-keep-sync] pull failed', e);
  }
}

function refreshDriveKeepStatus() {
  const statusEl = document.getElementById('driveKeepStatus');
  if (!statusEl) return;
  if (!window.DriveKeepSync || !DriveKeepSync.isConfigured()) {
    statusEl.textContent = '譛ｪ險ｭ螳・;
    return;
  }
  const ts = DriveKeepSync.getLastSyncedAt();
  statusEl.textContent = DriveKeepSync.isAuthorized()
    ? `騾｣謳ｺ貂医∩${ts ? ' / 譛邨ょ酔譛・ ' + new Date(ts).toLocaleString('ja-JP') : ''}`
    : '騾｣謳ｺ譛ｪ險ｱ蜿ｯ・医碁｣謳ｺ繧定ｨｱ蜿ｯ縲阪ｒ謚ｼ縺励※縺上□縺輔＞縲ゅ・繝ｼ繧ｸ繧帝幕縺咲峩縺吶◆縺ｳ縺ｫ蜀榊ｺｦ蠢・ｦ√〒縺呻ｼ・;
}

function wireDriveKeepSync() {
  const clientIdInput = document.getElementById('driveKeepClientIdInput');
  const authorizeBtn = document.getElementById('driveKeepAuthorizeBtn');
  const syncNowBtn = document.getElementById('driveKeepSyncNowBtn');
  if (!clientIdInput || !authorizeBtn || !syncNowBtn) return;

  if (window.DriveKeepSync && DriveKeepSync.isConfigured()) {
    // 菫晏ｭ俶ｸ医∩縺ｮ繧ｯ繝ｩ繧､繧｢繝ｳ繝・D縺後≠繧後・縲？TML縺ｮ蛻晄悄蛟､繧医ｊ蜆ｪ蜈医＠縺ｦ陦ｨ遉ｺ縺吶ｋ
    clientIdInput.value = DriveKeepSync.getClientId();
  } else if (window.DriveKeepSync && clientIdInput.value.trim()) {
    DriveKeepSync.setClientId(clientIdInput.value.trim());
  }

  authorizeBtn.addEventListener('click', async () => {
    if (!window.DriveKeepSync) { showToast('drive-keep-sync.js縺瑚ｪｭ縺ｿ霎ｼ縺ｾ繧後※縺・∪縺帙ｓ'); return; }
    DriveKeepSync.setClientId(clientIdInput.value.trim());
    try {
      await DriveKeepSync.authorize();
      showToast('Google Drive縺ｨ縺ｮ騾｣謳ｺ繧定ｨｱ蜿ｯ縺励∪縺励◆');
      refreshDriveKeepStatus();
      pullDriveKeepNotes();
    } catch (e) {
      showToast('騾｣謳ｺ縺ｫ螟ｱ謨励＠縺ｾ縺励◆: ' + e.message);
    }
  });

  syncNowBtn.addEventListener('click', async () => {
    if (!window.DriveKeepSync || !DriveKeepSync.isAuthorized()) {
      showToast('蜈医↓縲碁｣謳ｺ繧定ｨｱ蜿ｯ縲阪ｒ謚ｼ縺励※縺上□縺輔＞');
      return;
    }
    await pullDriveKeepNotes();
    showToast('蜷梧悄縺励∪縺励◆');
    refreshDriveKeepStatus();
  });
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// GOOGLE 繧ｹ繝励Ξ繝・ラ繧ｷ繝ｼ繝磯｣謳ｺ・医け繧､繝・け繧ｭ繝｣繝励メ繝｣逕ｨ縺ｮ荳譁ｹ蜷大叙繧願ｾｼ縺ｿ・・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
async function pullSheetsNotes() {
  if (!window.SheetsSync || !SheetsSync.isConfigured()) return;
  const g = currentGraph();
  if (!g) return;
  try {
    const items = await SheetsSync.pull();
    if (!items.length) return;

    let added = 0, lastId = null;
    items.forEach((item, i) => {
      const id = addNodeFromTransferItem(item, i, items.length, g, 'google-sheets');
      if (id) { added++; lastId = id; }
    });
    if (added > 0) {
      applyFlowchartLayout();
      saveGraphs();
      updateScoreBar();
      updateInboxBadge();
      if (lastId) fireNode(lastId);
      showToast(`繧ｹ繝励Ξ繝・ラ繧ｷ繝ｼ繝医°繧・{added}莉ｶ繧貞女菫｡縺励∪縺励◆`);
    }
  } catch (e) {
    console.warn('[sheets-sync] pull failed', e);
  }
}

function refreshSheetsStatus() {
  const statusEl = document.getElementById('sheetsSyncStatus');
  if (!statusEl) return;
  if (!window.SheetsSync || !SheetsSync.isConfigured()) {
    statusEl.textContent = '譛ｪ險ｭ螳・;
    return;
  }
  const ts = SheetsSync.getLastSyncedAt();
  statusEl.textContent = ts
    ? `險ｭ螳壽ｸ医∩ / 譛邨ょ酔譛・ ${new Date(ts).toLocaleString('ja-JP')}`
    : '險ｭ螳壽ｸ医∩・医∪縺譛ｪ蜷梧悄・・;
}

function wireSheetsSync() {
  const urlInput = document.getElementById('sheetsUrlInput');
  const tokenInput = document.getElementById('sheetsTokenInput');
  const saveBtn = document.getElementById('sheetsSaveConfigBtn');
  const syncNowBtn = document.getElementById('sheetsSyncNowBtn');
  if (!urlInput || !tokenInput || !saveBtn || !syncNowBtn) return;

  if (window.SheetsSync && SheetsSync.isConfigured()) {
    const c = SheetsSync.getConfig();
    urlInput.value = c.url;
    tokenInput.value = c.token;
  }

  saveBtn.addEventListener('click', async () => {
    if (!window.SheetsSync) { showToast('sheets-sync.js縺瑚ｪｭ縺ｿ霎ｼ縺ｾ繧後※縺・∪縺帙ｓ'); return; }
    SheetsSync.setConfig(urlInput.value, tokenInput.value);
    showToast('險ｭ螳壹ｒ菫晏ｭ倥＠縺ｾ縺励◆');
    await pullSheetsNotes();
    refreshSheetsStatus();
  });

  syncNowBtn.addEventListener('click', async () => {
    if (!window.SheetsSync || !SheetsSync.isConfigured()) { showToast('蜈医↓URL/繝医・繧ｯ繝ｳ繧定ｨｭ螳壹＠縺ｦ縺上□縺輔＞'); return; }
    await pullSheetsNotes();
    showToast('蜷梧悄縺励∪縺励◆');
    refreshSheetsStatus();
  });
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// CRYPTO-VAULT騾｣謳ｺ・医ち繧､繝医Ν縺ｮ縺ｿ繝ｻ荳譁ｹ蜷代∵里遏･ID縺ｧ驥崎､・賜髯､・・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
async function pullVaultNotes() {
  if (!window.VaultSync || !VaultSync.isConfigured()) return;
  const g = currentGraph();
  if (!g) return;
  try {
    const newItems = await VaultSync.pullNew();
    if (!newItems.length) return;

    // VaultSync蛛ｴ縺ｮ {id,title,category,updatedAt} 繧・addNodeFromTransferItem 縺・
    // 譛溷ｾ・☆繧・{id,title,body} 蠖｢蠑上↓螟画鋤縺吶ｋ
    const items = newItems.map(it => ({
      id: it.id,
      title: it.title,
      body: it.category ? `繧ｫ繝・ざ繝ｪ: ${it.category}` : '',
    }));

    let added = 0, lastId = null;
    items.forEach((item, i) => {
      const id = addNodeFromTransferItem(item, i, items.length, g, 'crypto-vault');
      if (id) { added++; lastId = id; }
    });
    if (added > 0) {
      applyFlowchartLayout();
      saveGraphs();
      updateScoreBar();
      updateInboxBadge();
      if (lastId) fireNode(lastId);
      showToast(`crypto-vault縺九ｉ${added}莉ｶ繧貞女菫｡縺励∪縺励◆`);
    }
  } catch (e) {
    console.warn('[vault-sync] pull failed', e);
  }
}

function refreshVaultStatus() {
  const statusEl = document.getElementById('vaultSyncStatus');
  if (!statusEl) return;
  if (!window.VaultSync || !VaultSync.isConfigured()) {
    statusEl.textContent = '譛ｪ險ｭ螳・;
    return;
  }
  const ts = VaultSync.getLastSyncedAt();
  statusEl.textContent = ts
    ? `險ｭ螳壽ｸ医∩ / 譛邨ょ酔譛・ ${new Date(ts).toLocaleString('ja-JP')}`
    : '險ｭ螳壽ｸ医∩・医∪縺譛ｪ蜷梧悄・・;
}

function wireVaultSync() {
  const urlInput = document.getElementById('vaultUrlInput');
  const tokenInput = document.getElementById('vaultTokenInput');
  const saveBtn = document.getElementById('vaultSaveConfigBtn');
  const syncNowBtn = document.getElementById('vaultSyncNowBtn');
  if (!urlInput || !tokenInput || !saveBtn || !syncNowBtn) return;

  if (window.VaultSync && VaultSync.isConfigured()) {
    const c = VaultSync.getConfig();
    urlInput.value = c.endpoint;
    tokenInput.value = c.token;
  }

  saveBtn.addEventListener('click', async () => {
    if (!window.VaultSync) { showToast('vault-sync.js縺瑚ｪｭ縺ｿ霎ｼ縺ｾ繧後※縺・∪縺帙ｓ'); return; }
    VaultSync.setConfig(urlInput.value, tokenInput.value);
    showToast('險ｭ螳壹ｒ菫晏ｭ倥＠縺ｾ縺励◆');
    await pullVaultNotes();
    refreshVaultStatus();
  });

  syncNowBtn.addEventListener('click', async () => {
    if (!window.VaultSync || !VaultSync.isConfigured()) { showToast('蜈医↓URL/繝医・繧ｯ繝ｳ繧定ｨｭ螳壹＠縺ｦ縺上□縺輔＞'); return; }
    await pullVaultNotes();
    showToast('蜷梧悄縺励∪縺励◆');
    refreshVaultStatus();
  });
}

function openSyncSheet() {
  const isDesktop = window.SyncBridge && SyncBridge.isDesktopCapable();
  document.getElementById('syncDesktopBox').style.display = isDesktop ? '' : 'none';
  document.getElementById('syncMobileBox').style.display = isDesktop ? 'none' : '';
  refreshSyncStatus();
  refreshCloudSyncStatus();
  refreshDriveKeepStatus();
  refreshSheetsStatus();
  refreshEmotionBridgeStatus();
  refreshVaultStatus();
  openSheet('syncSheet');
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// 諢滓ュ繝悶Μ繝・ず・・uick-ref繝ｻ蜿梧婿蜷代∥ttractor迥ｶ諷九・縺ｿ・・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
const EB_SELF_APP = 'flow-mind';
let ebPushTimer = null;
let ebLastPushedLabel = null;

function refreshEmotionBridgeStatus() {
  const statusEl = document.getElementById('ebStatus');
  if (!statusEl || !window.EmotionBridgeClient) return;
  const c = EmotionBridgeClient.getConfig();
  document.getElementById('ebEndpointInput').value = c.endpoint || '';
  document.getElementById('ebTokenInput').value = c.token || '';
  statusEl.textContent = EmotionBridgeClient.isConfigured() ? '險ｭ螳壽ｸ医∩' : '譛ｪ險ｭ螳・;
}

// 繝弱・繝我ｿ晏ｭ倥・縺溘・縺ｫ蜻ｼ縺ｶ縲Ｂttractor縺ｮdedup縺ｨ縺ｯ辟｡髢｢菫ゅ↓縲∝・螳ｹ繧堤峩謗･push縺吶ｋ
// ・・uick-ref蛛ｴ縺ｮpushEmotionToFlowMind()縺ｨ蟇ｾ縺ｫ縺ｪ繧九∽ｿ晏ｭ倥ヨ繝ｪ繧ｬ繝ｼ迚茨ｼ・
async function pushNodeToEmotionBridge(n) {
  if (!window.EmotionBridgeClient || !EmotionBridgeClient.isConfigured() || !n) return;
  try {
    await EmotionBridgeClient.push(EB_SELF_APP, {
      title: n.label || '',
      body: (n.memo || '').slice(0, 400),
      attractor: currentAttractor ? currentAttractor.label : null,
    });
  } catch (e) {
    console.warn('[emotion-bridge] push on save failed', e);
  }
}

// attractor・域─諠・憾諷具ｼ峨′螟峨ｏ縺｣縺溘→縺阪□縺代√ョ繝舌え繝ｳ繧ｹ縺励※騾∽ｿ｡縺吶ｋ
function scheduleEmotionBridgePush() {
  if (!window.EmotionBridgeClient || !EmotionBridgeClient.isConfigured()) return;
  const label = currentAttractor ? currentAttractor.label : null;
  if (label === ebLastPushedLabel) return; // 螟牙喧縺後↑縺代ｌ縺ｰ騾√ｉ縺ｪ縺・
  clearTimeout(ebPushTimer);
  ebPushTimer = setTimeout(async () => {
    try {
      const g = currentGraph();
      const topNodeLabels = g ? Object.values(g.nodes)
        .filter(n => currentSyncClusters.some(c => c.nodeIds.includes(n.id)))
        .map(n => n.label).slice(0, 5) : [];
      await EmotionBridgeClient.push(EB_SELF_APP, {
        attractor: currentAttractor ? currentAttractor.label : null,
        topNodeLabels,
        graphName: g ? g.name : null,
      });
      ebLastPushedLabel = label;
    } catch (e) {
      console.warn('[emotion-bridge] push failed', e);
    }
  }, 1500);
}

// quick-ref縺九ｉ譚･縺滓─諠・ョ繝ｼ繧ｿ繧偵∝叙繧願ｾｼ縺ｿ繝弱・繝峨→縺励※繧ｰ繝ｩ繝輔↓蜿肴丐縺吶ｋ
async function pollEmotionBridge() {
  if (!window.EmotionBridgeClient || !EmotionBridgeClient.isConfigured()) return;
  try {
    const record = await EmotionBridgeClient.pull(EB_SELF_APP);
    if (!record || !record.payload) return;
    const g = currentGraph();
    if (!g) return;
    const p = record.payload;
    const title = p.title || (p.attractor ? `quick-ref: ${p.attractor}` : 'quick-ref縺九ｉ');
    const item = { title, body: p.body || p.summary || '', source: 'quick-ref' };
    const id = addNodeFromTransferItem(item, 0, 1, g, 'quick-ref');
    if (id) {
      applyFlowchartLayout();
      saveGraphs();
      updateScoreBar();
      updateInboxBadge();
      fireNode(id);
      showToast('quick-ref縺九ｉ諢滓ュ繝・・繧ｿ繧貞女菫｡縺励∪縺励◆');
    }
  } catch (e) {
    console.warn('[emotion-bridge] pull failed', e);
  }
}
// 笏笏 quick-ref (sync-worker) 蟆ら畑縺ｮ閾ｪ蜍輔ヮ繝ｼ繝牙叙繧願ｾｼ縺ｿ 笏笏
async function pollQuickRefSync() {
  const endpoint = localStorage.getItem('qr_sync_endpoint');
  const token = localStorage.getItem('qr_sync_token');
  if (!endpoint || !token) return;

  try {
    const baseUrl = endpoint.replace(/\/+$/, '');
    const res = await fetch(`${baseUrl}/sync/quick-ref`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;

    const res_json = await res.json();
    const items = (res_json.data && res_json.data.items) || [];
    if (!items.length) return;

    const g = currentGraph();
    if (!g) return;

    const importedIds = JSON.parse(localStorage.getItem('flow_mind_imported_quickref_ids') || '[]');
    const importedSet = new Set(importedIds);
    let addedCount = 0;

    const stripHtml = html => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html || '';
      return tmp.textContent || tmp.innerText || '';
    };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.id || importedSet.has(item.id)) continue;
      if (item.sensitive) { importedSet.add(item.id); continue; } // 讖溷ｯ・Γ繝｢縺ｯ髯､螟悶＠縺ｦ險俶・

      const plainBody = stripHtml(item.body);
      const transferItem = {
        title: item.title || plainBody.slice(0, 20) || 'quick-ref 繝｡繝｢',
        body: plainBody,
        category: (item.tags && item.tags.length > 0) ? item.tags.join(', ') : 'quick-ref',
        source: 'quick-ref'
      };

      const id = addNodeFromTransferItem(transferItem, i, items.length, g, 'quick-ref');
      if (id) {
        importedSet.add(item.id);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      localStorage.setItem('flow_mind_imported_quickref_ids', JSON.stringify([...importedSet]));
      applyFlowchartLayout();
      saveGraphs();
      updateScoreBar();
      updateInboxBadge();
      showToast(`quick-ref縺九ｉ ${addedCount} 莉ｶ縺ｮ繝｡繝｢繧定・蜍募叙繧願ｾｼ縺ｿ縺励∪縺励◆`);
    }
  } catch (e) {
    console.warn('[quick-ref-sync] poll failed', e);
  }
}

// 險ｭ螳壹Δ繝ｼ繝繝ｫ蛻晄悄蛹・& 菫晏ｭ倥う繝吶Φ繝磯・邱・
function wireQuickRefSyncModal() {
  const endpointInput = document.getElementById('qrSyncEndpointInput');
  const tokenInput = document.getElementById('qrSyncTokenInput');
  const saveBtn = document.getElementById('qrSyncSaveConfigBtn');

  if (endpointInput) endpointInput.value = localStorage.getItem('qr_sync_endpoint') || '';
  if (tokenInput) tokenInput.value = localStorage.getItem('qr_sync_token') || '';

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const ep = (endpointInput ? endpointInput.value : '').trim();
      const tk = (tokenInput ? tokenInput.value : '').trim();
      localStorage.setItem('qr_sync_endpoint', ep);
      localStorage.setItem('qr_sync_token', tk);
      showToast('quick-ref蜷梧悄險ｭ螳壹ｒ菫晏ｭ倥＠縺ｾ縺励◆');
      pollQuickRefSync(); // 菫晏ｭ倡峩蠕後↓1蝗槫叉譎ょｮ溯｡・
    });
  }
}
function wireEmotionBridge() {
  const saveBtn = document.getElementById('ebSaveConfigBtn');
  const pullBtn = document.getElementById('ebPullNowBtn');
  if (!saveBtn || !pullBtn || !window.EmotionBridgeClient) return;

  saveBtn.addEventListener('click', () => {
    const endpoint = document.getElementById('ebEndpointInput').value;
    const token = document.getElementById('ebTokenInput').value;
    EmotionBridgeClient.setConfig(endpoint, token);
    showToast('諢滓ュ繝悶Μ繝・ず縺ｮ險ｭ螳壹ｒ菫晏ｭ倥＠縺ｾ縺励◆');
    refreshEmotionBridgeStatus();
  });

  pullBtn.addEventListener('click', async () => {
    await pollEmotionBridge();
    showToast('蜿門ｾ励＠縺ｾ縺励◆');
  });
}

async function refreshSyncStatus() {
  if (!window.SyncBridge) return;
  if (SyncBridge.isDesktopCapable()) {
    const connected = await SyncBridge.isConnected('flow-mind');
    const ts = SyncBridge.getLastSyncedAt('flow-mind');
    document.getElementById('syncDesktopStatus').textContent = connected
      ? `謗･邯壽ｸ医∩${ts ? ' / 譛邨ょ酔譛・ ' + new Date(ts).toLocaleString('ja-JP') : ''}`
      : '譛ｪ謗･邯・;
  } else {
    const ts = SyncBridge.getLastSyncedAt('flow-mind-sync');
    document.getElementById('syncMobileStatus').textContent = ts
      ? `譛邨よ嶌縺榊・縺・ ${new Date(ts).toLocaleString('ja-JP')}`
      : '縺ｾ縺譖ｸ縺榊・縺励※縺・∪縺帙ｓ';
  }
}

function wireSyncSheet() {
  wireCloudSync();
  wireDriveKeepSync();
  wireSheetsSync();
  wireVaultSync();
  document.getElementById('syncBtn').addEventListener('click', openSyncSheet);
  document.getElementById('syncSheetClose').addEventListener('click', () => closeSheet('syncSheet'));

  document.getElementById('syncConnectBtn').addEventListener('click', async () => {
    if (!window.SyncBridge) { showToast('蜷梧悄繝｢繧ｸ繝･繝ｼ繝ｫ縺瑚ｪｭ縺ｿ霎ｼ縺ｾ繧後※縺・∪縺帙ｓ'); return; }
    try {
      await SyncBridge.connectFolder('flow-mind');
      showToast('繝輔か繝ｫ繝縺ｫ謗･邯壹＠縺ｾ縺励◆');
      await checkCloudOnLoad();
      SyncBridge.autoSave('flow-mind', graphs); // 謗･邯夂峩蠕後↓迴ｾ蝨ｨ縺ｮ迥ｶ諷九ｒ荳蠎ｦ譖ｸ縺崎ｾｼ繧
      refreshSyncStatus();
    } catch(e) {
      console.error(e);
      showToast('謗･邯壹↓螟ｱ謨励＠縺ｾ縺励◆: ' + e.message);
    }
  });

  document.getElementById('syncNowBtn').addEventListener('click', async () => {
    if (!window.SyncBridge || !(await SyncBridge.isConnected('flow-mind'))) {
      showToast('蜈医↓繝輔か繝ｫ繝縺ｸ謗･邯壹＠縺ｦ縺上□縺輔＞');
      return;
    }
    SyncBridge.autoSave('flow-mind', graphs);
    showToast('蜷梧悄縺励∪縺励◆');
    setTimeout(refreshSyncStatus, 1400);
  });

  document.getElementById('syncExportBtn').addEventListener('click', () => {
    if (!window.SyncBridge) { showToast('蜷梧悄繝｢繧ｸ繝･繝ｼ繝ｫ縺瑚ｪｭ縺ｿ霎ｼ縺ｾ繧後※縺・∪縺帙ｓ'); return; }
    SyncBridge.exportToFiles('flow-mind-sync.json', graphs);
    showToast('譖ｸ縺榊・縺励∪縺励◆縲ゆｿ晏ｭ伜・縺ｧiCloud Drive繧帝∈繧薙〒縺上□縺輔＞');
    setTimeout(refreshSyncStatus, 300);
  });

  document.getElementById('syncImportBtn').addEventListener('click', async () => {
    if (!window.SyncBridge) { showToast('蜷梧悄繝｢繧ｸ繝･繝ｼ繝ｫ縺瑚ｪｭ縺ｿ霎ｼ縺ｾ繧後※縺・∪縺帙ｓ'); return; }
    const payload = await SyncBridge.importFromFiles();
    if (!payload || !payload.data) return;
    if (!confirm('迴ｾ蝨ｨ縺ｮ繧ｰ繝ｩ繝輔ｒ隱ｭ縺ｿ霎ｼ繧薙□繝・・繧ｿ縺ｧ荳頑嶌縺阪＠縺ｾ縺吶ゅｈ繧阪＠縺・〒縺吶°・・)) return;
    graphs = payload.data;
    const ids = Object.keys(graphs);
    currentGraphId = ids[0] || null;
    if (!currentGraphId) createGraph('縺ｯ縺倥ａ縺ｦ縺ｮ繧ｰ繝ｩ繝・);
    else localStorage.setItem(LS_CURRENT, currentGraphId);
    applyFlowchartLayout();
    saveGraphs();
    centerView();
    updateScoreBar();
    renderGraphList();
    showToast('隱ｭ縺ｿ霎ｼ縺ｿ縺ｾ縺励◆');
  });
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// ONBOARDING・亥・蝗櫁ｵｷ蜍墓凾縺ｮ菴ｿ縺・婿譯亥・・・
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
const LS_ONBOARDING = 'fm_onboarding_seen';

const ONBOARDING_STEPS = [
  {
    icon: '・・,
    title: '霑ｽ蜉繝｢繝ｼ繝・,
    desc: '繧ｭ繝｣繝ｳ繝舌せ繧偵ち繝・・縺吶ｋ縺ｨ譁ｰ縺励＞繝弱・繝峨′霑ｽ蜉縺輔ｌ縺ｾ縺吶ゅ∪縺壹・諤昴＞縺､縺・◆縺薙→繧偵←繧薙←繧薙ヮ繝ｼ繝峨↓縺励※縺ｿ縺ｾ縺励ｇ縺・・,
  },
  {
    icon: '竊・,
    title: '謗･邯壹Δ繝ｼ繝・,
    desc: '謗･邯壼・繝弱・繝峨ｒ繧ｿ繝・・竊呈磁邯壼・繝弱・繝峨ｒ繧ｿ繝・・縺ｧ縲∫泙蜊ｰ(蝗譫憺未菫・繧貞ｼ輔￠縺ｾ縺吶ゅヮ繝ｼ繝牙酔螢ｫ繧偵▽縺ｪ縺舌→縲∬・蜍輔〒繝輔Ο繝ｼ繝√Ε繝ｼ繝医・繧医≧縺ｫ謨ｴ蛻励＠縺ｾ縺吶・,
  },
  {
    icon: '笨・,
    title: '邱ｨ髮・Δ繝ｼ繝・,
    desc: '繝弱・繝峨ｒ繧ｿ繝・・縺ｧ邱ｨ髮・√お繝・ず繧偵ち繝・・縺ｧ蜑企勁縺ｧ縺阪∪縺吶る・鄂ｮ縺ｯ閾ｪ蜍墓紛蛻励＆繧後ｋ縺ｮ縺ｧ縲√ラ繝ｩ繝・げ縺ｧ縺ｮ菴咲ｽｮ隱ｿ謨ｴ縺ｯ荳崎ｦ√〒縺吶・,
  },
];

let onboardingStep = 0;

function renderOnboardingStep() {
  const s = ONBOARDING_STEPS[onboardingStep];
  const body = document.getElementById('onboardingBody');
  body.innerHTML = `
    <div style="text-align:center;padding:16px 0 8px;">
      <div style="font-size:32px;width:72px;height:72px;line-height:72px;margin:0 auto 18px;
        border-radius:50%;background:var(--gold-dim);color:var(--gold);">${s.icon}</div>
      <div style="font-size:17px;font-weight:800;margin-bottom:10px;">${s.title}</div>
      <div style="font-size:14px;color:var(--text-mid);line-height:1.75;padding:0 8px;">${s.desc}</div>
    </div>`;
  document.getElementById('onboardingStepIndicator').textContent =
    `${onboardingStep + 1} / ${ONBOARDING_STEPS.length}`;
  document.getElementById('onboardingNextBtn').textContent =
    (onboardingStep === ONBOARDING_STEPS.length - 1) ? '縺ｯ縺倥ａ繧・ : '谺｡縺ｸ';
}

function openOnboarding() {
  onboardingStep = 0;
  renderOnboardingStep();
  openSheet('onboardingSheet');
}

function closeOnboardingAndMark() {
  try { localStorage.setItem(LS_ONBOARDING, '1'); } catch (e) {}
  closeSheet('onboardingSheet');
}

function wireOnboarding() {
  document.getElementById('onboardingNextBtn').addEventListener('click', () => {
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      onboardingStep++;
      renderOnboardingStep();
    } else {
      closeOnboardingAndMark();
    }
  });
  document.getElementById('onboardingSkip').addEventListener('click', closeOnboardingAndMark);
  document.getElementById('helpBtn').addEventListener('click', openOnboarding);
  document.getElementById('dailyNoteBtn').addEventListener('click', openOrCreateDailyNode);
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// WIRE EVENTS
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function wireEvents() {
  // 繝｢繝ｼ繝・
  document.getElementById('addModeBtn').addEventListener('click', () => setMode(MODE.ADD));
  document.getElementById('connectModeBtn').addEventListener('click', () => setMode(MODE.CONNECT));
  document.getElementById('editModeBtn').addEventListener('click', () => setMode(MODE.EDIT));

  // 繝弱・繝峨す繝ｼ繝・
  document.getElementById('nodeSheetCancel').addEventListener('click', () => closeSheet('nodeSheet'));
  document.getElementById('nodeSheetSave').addEventListener('click', saveNodeSheet);
  document.getElementById('inboxBannerBtn').addEventListener('click', () => {
    if (editingNodeId) markNodeInboxDone(editingNodeId);
  });

  // 驥阪∩繧ｹ繝ｩ繧､繝繝ｼ
  const slider = document.getElementById('nWeight');
  slider.addEventListener('input', () => {
    document.getElementById('nWeightVal').textContent = slider.value;
    updateSliderPct(slider);
  });

  // 繧ｫ繝ｩ繝ｼ繧ｹ繧ｦ繧ｩ繝・メ
  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      editingNodeColor = sw.dataset.color;
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
    });
  });

  // 繝弱・繝牙炎髯､
  document.getElementById('deleteNodeBtn').addEventListener('click', () => {
    if (selectedNode && confirm('縺薙・繝弱・繝峨ｒ蜑企勁縺励∪縺吶°・・)) deleteNode(selectedNode);
  });

  // 繝ｪ繧ｻ繝・ヨ繝薙Η繝ｼ
  document.getElementById('resetViewBtn').addEventListener('click', () => { centerView(); });

  // 繧ｨ繝・ず繝偵Φ繝・
  document.getElementById('edgeDeleteBtn').addEventListener('click', () => {
    if (selectedEdge) { deleteEdge(selectedEdge); selectedEdge=null; }
    document.getElementById('edgeHint').classList.remove('show');
  });
  document.getElementById('edgeCancelBtn').addEventListener('click', () => {
    selectedEdge = null;
    document.getElementById('edgeHint').classList.remove('show');
  });

  // AI蛻・梵繧ｷ繝ｼ繝・
  document.getElementById('analyzeBtn').addEventListener('click', () => {
    const modelKey = localStorage.getItem(LS_MODEL) || 'claude';
    document.getElementById('aiModelBadge').textContent = MODELS[modelKey]?.label || modelKey;
    document.getElementById('aiResultBox').classList.remove('visible');
    openSheet('aiSheet');
  });
  document.getElementById('aiSheetClose').addEventListener('click', () => closeSheet('aiSheet'));
  document.getElementById('aiStructureBtn').addEventListener('click', () => runAnalysis('structure'));
  document.getElementById('aiWeakBtn').addEventListener('click', () => runAnalysis('weak'));
  document.getElementById('aiSuggestBtn').addEventListener('click', () => runAnalysis('suggest'));
  document.getElementById('aiHonneBtn').addEventListener('click', () => runAnalysis('honne'));
  document.getElementById('aiRetagBtn').addEventListener('click', aiRetagAllNodes);
  document.getElementById('aiCustomBtn').addEventListener('click', () => {
    const v = document.getElementById('aiCustomInput').value.trim();
    if (v) runAnalysis(null, v);
  });
  document.getElementById('aiCustomInput').addEventListener('keydown', e => {
    if (e.key==='Enter') { const v=e.target.value.trim(); if(v) runAnalysis(null,v); }
  });

  // 繧ｰ繝ｩ繝穂ｸ隕ｧ
  document.getElementById('graphsBtn').addEventListener('click', () => { renderGraphList(); openSheet('graphsSheet'); });
  document.getElementById('graphsSheetClose').addEventListener('click', () => closeSheet('graphsSheet'));
  document.getElementById('newGraphBtn').addEventListener('click', () => {
    const name = prompt('繧ｰ繝ｩ繝募錐繧貞・蜉帙＠縺ｦ縺上□縺輔＞', '譁ｰ縺励＞繧ｰ繝ｩ繝・);
    if (!name) return;
    createGraph(name.trim() || '譁ｰ縺励＞繧ｰ繝ｩ繝・);
    renderGraphList();
    closeSheet('graphsSheet');
    centerView();
    showToast(`縲・{name}縲阪ｒ菴懈・縺励∪縺励◆`);
  });
  document.getElementById('importTransferBtn').addEventListener('click', importFromTransfer);

  // overlay
  document.getElementById('overlay').addEventListener('click', closeAllSheets);
}

// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
// INIT
// 笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊・
function init() {
  loadGraphs();
  checkImportHash();
  applyFlowchartLayout();
  resizeCanvas();
  centerView();
  setMode(MODE.ADD);
  wireEvents();
  wireQuickCapture();
  wireSyncSheet();
  wireOnboarding();
  wireCopyButtons();
  wireEmotionBridge();
  wireQuickRefSyncModal();
  wireSearchSheet();
  wireEmbeds();
  updateScoreBar();
  updateInboxBadge();
  checkCaptureHash();
  checkEmotionTransfer();
  checkCloudOnLoad();
  checkCloudSyncOnLoad();
  pullSheetsNotes(); // 險ｭ螳壽ｸ医∩縺ｪ繧峨・崕霆翫・荳ｭ縺ｧ譖ｸ縺・◆繝｡繝｢繧定ｵｷ蜍墓凾縺ｫ閾ｪ蜍輔〒蜿悶ｊ霎ｼ繧
  pullVaultNotes(); // 險ｭ螳壽ｸ医∩縺ｪ繧峨…rypto-vault縺ｮ譁ｰ隕上ち繧､繝医Ν繧定ｵｷ蜍墓凾縺ｫ閾ｪ蜍輔〒蜿悶ｊ霎ｼ繧

  // 莉悶い繝励Μ(quick-ref遲・縺九ｉ縺ｮ閾ｪ蜍暮∽ｿ｡繧貞ｮ壽悄繝√ぉ繝・け + 繝壹・繧ｸ蠕ｩ蟶ｰ譎ゅ↓繧ゅメ繧ｧ繝・け
  setInterval(checkEmotionTransfer, 4000);
  let lastCloudCheck = 0;
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkEmotionTransfer();
      const now = Date.now();
      if (now - lastCloudCheck > 5000) {
        lastCloudCheck = now;
        checkCloudSyncOnResume();
      }
    }
  });

  // Google Keep(Drive邨檎罰)縺ｮ螳壽悄蜷梧悄・郁ｪ榊庄貂医∩縺ｮ蝣ｴ蜷医・縺ｿ螳溯｡後＆繧後ｋ・・
  setInterval(pullDriveKeepNotes, 60000);

  // 諢滓ュ繝悶Μ繝・ず(quick-ref)縺ｮ螳壽悄蜿門ｾ暦ｼ域悴險ｭ螳壹・蝣ｴ蜷医・菴輔ｂ縺励↑縺・ｼ・
  setInterval(pollEmotionBridge, 20000);
  pollEmotionBridge();

  render();

  // 笏笏 繧ｯ繝ｩ繧ｦ繝芽・蜍輔Ο繝ｼ繝会ｼ郁ｿｽ蜉・・笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
  // SyncBridge 縺梧ｧ区・貂医∩縺ｪ繧峨け繝ｩ繧ｦ繝峨・譖ｴ譁ｰ繧偵メ繧ｧ繝・け縺励※蜿肴丐
  loadFromCloud();

  // 蛻晏屓襍ｷ蜍墓凾縺ｮ縺ｿ繧ｪ繝ｳ繝懊・繝・ぅ繝ｳ繧ｰ繧定・蜍戊｡ｨ遉ｺ
  if (!localStorage.getItem(LS_ONBOARDING)) {
    openOnboarding();
  }
}

window.addEventListener("resize", resizeCanvas);
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./flow-mind-sw.js");
}

init();
