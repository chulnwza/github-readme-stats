// @ts-check

import { Card } from "../src/common/Card.js";
import { getCardColors } from "../src/common/color.js";

const PADDING = 25;
const TITLE_HEIGHT = 35;

/**
 * @param {any} req
 * @param {any} res
 */
export default async (req, res) => {
  const {
    icons = "laravel,fastapi,vue,react,ts,tailwind,bootstrap,docker,redis,postgres,mysql,pytorch",
    perline = "6",
    title_color,
    text_color,
    bg_color,
    border_color,
    theme = "default",
    hide_border = "false",
    custom_title = "Tech Stack",
    border_radius,
    disable_animations,
  } = req.query;

  res.setHeader("Content-Type", "image/svg+xml");

  const iconList = String(icons)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let innerSvg = "";
  let svgWidth = 300;
  let svgHeight = 100;
  let svgViewBox = "0 0 300 100";

  try {
    const url = `https://skillicons.dev/icons?i=${iconList.join(",")}&perline=${perline}`;
    const response = await fetch(url);
    const svgText = await response.text();

    const widthMatch = svgText.match(/\bwidth="(\d+(?:\.\d+)?)"/);
    const heightMatch = svgText.match(/\bheight="(\d+(?:\.\d+)?)"/);
    const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/);

    if (widthMatch) svgWidth = parseFloat(widthMatch[1]);
    if (heightMatch) svgHeight = parseFloat(heightMatch[1]);
    if (viewBoxMatch) svgViewBox = viewBoxMatch[1];

    const innerMatch = svgText.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
    if (innerMatch) innerSvg = innerMatch[1];
  } catch (_e) {
    innerSvg = `<text x="0" y="24" fill="#e96d71" font-family="sans-serif" font-size="14">Failed to load icons</text>`;
  }

  const CARD_WIDTH = svgWidth + PADDING * 2;
  const CARD_HEIGHT = svgHeight + PADDING * 2 + TITLE_HEIGHT;

  const colors = getCardColors({
    title_color,
    text_color,
    bg_color,
    border_color,
    theme,
  });

  const card = new Card({
    customTitle: String(custom_title),
    defaultTitle: "Tech Stack",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    border_radius,
    colors,
  });

  if (disable_animations === "true") card.disableAnimations();
  card.setHideBorder(hide_border === "true");

  return res.send(
    card.render(`
      <svg
        x="${PADDING}"
        y="${TITLE_HEIGHT + PADDING}"
        width="${svgWidth}"
        height="${svgHeight}"
        viewBox="${svgViewBox}"
      >
        ${innerSvg}
      </svg>
    `),
  );
};
