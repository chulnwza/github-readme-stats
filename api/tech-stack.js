// @ts-check

import { Card } from "../src/common/Card.js";
import { getCardColors } from "../src/common/color.js";

const ICON_SIZE = 48;
const ICON_GAP = 12;
const PADDING = 25;
const TITLE_HEIGHT = 35;

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
  const cols = Math.min(parseInt(String(perline), 10), iconList.length);
  const rows = Math.ceil(iconList.length / cols);

  const iconAreaWidth = cols * ICON_SIZE + (cols - 1) * ICON_GAP;
  const iconAreaHeight = rows * ICON_SIZE + (rows - 1) * ICON_GAP;

  const CARD_WIDTH = iconAreaWidth + PADDING * 2;
  const CARD_HEIGHT = iconAreaHeight + PADDING * 2 + TITLE_HEIGHT;

  let innerSvg = "";
  let svgViewBox = `0 0 ${iconAreaWidth} ${iconAreaHeight}`;

  try {
    const url = `https://skillicons.dev/icons?i=${iconList.join(",")}&perline=${perline}`;
    const response = await fetch(url);
    const svgText = await response.text();

    const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/);
    if (viewBoxMatch) svgViewBox = viewBoxMatch[1];

    const innerMatch = svgText.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
    if (innerMatch) innerSvg = innerMatch[1];
  } catch (_e) {
    innerSvg = `<text x="0" y="24" fill="#e96d71" font-family="sans-serif" font-size="14">Failed to load icons</text>`;
  }

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
        width="${iconAreaWidth}"
        height="${iconAreaHeight}"
        viewBox="${svgViewBox}"
      >
        ${innerSvg}
      </svg>
    `),
  );
};
