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
const escape = (str) =>
  str.replace(/[^a-zA-Z0-9]/g, "_").replace(/^(\d)/, "_$1");
const semiEscape = (str) =>
  str.replace(/["()]/g, "").replace(/([0-9]+)\. /, "$1 ");
const createMermaidBoxes = (items, whichToShow) => {
  const boxes = items.map(
    (item) =>
      `    ${escape(item)}[${semiEscape(item)}]` +
      (whichToShow.includes(item) ? "" : ":::transparent"),
  );

  return ["graph TD", ...boxes].join("\n");
};
export const createGraph = (inputs, embeds, whichToShow) => {
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

  let mermaid = createMermaidBoxes(inputs, whichToShow);
  for (const [a, b] of connections) {
    mermaid += `
    ${escape(a)} <--> ${escape(b)}`;
  }
  mermaid += `

classDef transparent fill:transparent,color:transparent`;
  return mermaid;
};
