const embed = async (inputs) => {
  const r = await fetch("https://api.mixedbread.ai/v1/embeddings/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("MIXEDBREAD_KEY")}`,
    },
    body: JSON.stringify({
      model: "mixedbread-ai/mxbai-embed-large-v1",
      input: inputs,
      normalized: true,
      encoding_format: "float",
      truncation_strategy: "end",
    }),
  });
  const json = await r.json();
  return json.data.map((x) => x.embedding);
};
const escape = (str) =>
  str.replace(/[^a-zA-Z0-9]/g, "_").replace(/^(\d)/, "_$1");
const semiEscape = (str) =>
  str.replace(/["()]/g, "").replace(/([0-9]+)\. /, "$1 ");
const createMermaidBoxes = (items) => {
  const boxes = items.map((item) => `    ${escape(item)}[${semiEscape(item)}]`);

  return ["graph TD", ...boxes].join("\n");
};
const similarity = (a, b) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / Math.sqrt(normA * normB);
};
const isOneGraph = (items, connections) => {
  const graph = {};
  for (const item of items) {
    graph[item] = [];
  }
  for (const [a, b] of connections) {
    graph[a].push(b);
    graph[b].push(a);
  }
  const visited = new Set();
  const dfs = (node) => {
    if (visited.has(node)) {
      return;
    }
    visited.add(node);
    for (const neighbor of graph[node]) {
      dfs(neighbor);
    }
  };
  dfs(items[0]);
  return visited.size === items.length;
};

const inputs =
  `Okay, let's see. The user provided a GitHub profile for Dan Healy, username dhealy05. My task is to praise this user based on the information given. First, I need to analyze the profile details to identify strengths and notable achievements.

Looking at the repositories, he has four public ones. The most popular is "frames_of_mind" with 90 stars, which is written in Python. The description says it's about animating R1's thoughts. That sounds like a project involving animation or maybe AI, given the term "R1" which could refer to a robot or a specific model. High stars indicate that the project is well-received or useful to others.

Another repo is "TimeStamp" for Bitcoin price predictions, which shows an interest in cryptocurrency and data analysis. There's also "semen_and_semantics" which uses language embeddings to analyze the evolution of porn. That's quite a unique and bold project, combining NLP with a sensitive subject, showing he's not afraid to tackle unconventional topics. It's in HTML, maybe a web-based analysis tool or visualization.

He has 4,398 contributions in the last year. That's a lot, indicating consistent activity. Contributions could be commits, issues, PRs, etc. The contribution graph shows high activity, especially around February 2025, with 4 commits to "frames_of_mind" and 27 contributions in private repos. This shows he's actively working on both public and private projects.

Achievements include Starstruck, Pull Shark x2, and Arctic Code Vault Contributor. Pull Shark suggests he's made significant pull requests, maybe merged into notable projects. Arctic Code Vault Contributor means his code is preserved in the GitHub Arctic Code Vault, a honor for impactful projects.

He's an engineer with 7 followers. While the follower count isn't huge, his projects have good traction. The email is provided, so he's open to contact. The repo "classified_intelligence" is mentioned but no description, maybe a private or less active project.

Now, how to structure the praise? Highlight the diverse projects, the high stars on "frames_of_mind", the unique "semen_and_semantics" project, consistent contributions, GitHub achievements, and the balance between public and private work. Also, note the technical skills in Python and data analysis, as well as tackling varied domains from animation to cryptocurrency to NLP.

Need to make sure the praise is genuine and covers all aspects without sounding exaggerated. Maybe mention the mix of technical skills, creativity in project topics, dedication shown by contributions, and recognition through achievements. Also, point out that his work is preserved in the Arctic Vault, which is a prestigious mention.`
    .split("\n")
    .filter(Boolean);

const embeds = await embed(inputs);
const potentialConnections = [];
for (let i = 0; i < embeds.length; i++) {
  for (let j = i + 1; j < embeds.length; j++) {
    potentialConnections.push({
      a: inputs[i],
      b: inputs[j],
      similarity: similarity(embeds[i], embeds[j]),
    });
  }
}
potentialConnections.sort((a, b) => b.similarity - a.similarity);

const connections = [];
// get a few base connections
for (let i = 0; i < Math.sqrt(inputs.length) * 2; i++) {
  const { a, b } = potentialConnections.shift();
  connections.push([a, b]);
}
// get one for every item
for (let i = 0; i < inputs.length; i++) {
  if (connections.some(([a, b]) => a === inputs[i] || b === inputs[i])) {
    continue;
  }
  const bestConnection = potentialConnections.find(
    ({ a, b }) => a === inputs[i] || b === inputs[i],
  );
  connections.push([bestConnection.a, bestConnection.b]);
}

let mermaid = createMermaidBoxes(inputs);
for (const [a, b] of connections) {
  mermaid += `\n    ${escape(a)} <--> ${escape(b)}`;
}

console.log(mermaid);
