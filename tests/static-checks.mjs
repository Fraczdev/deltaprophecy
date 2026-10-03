import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

check(exists('index-noredirect.html'), 'missing standalone editor');
check(exists('assets/scripts/gif.worker.js'), 'missing GIF worker');
check(exists('assets/scripts/gif.js'), 'missing local GIF encoder');

for (const resource of [
  'assets/favicon.png',
  'assets/fonts/PROPHECYTYPE.ttf',
  'assets/fonts/DTM-Sans.otf',
  'assets/depth/depth.png',
  'assets/depth/depth-text.png',
  'assets/depth/depth-blue.png',
  'assets/depth/depth-yetdarker-new.png',
  'assets/base-panels/roots.png',
]) {
  check(exists(resource), `missing local resource: ${resource}`);
}

const source = read('index-noredirect.html');
check(source.includes("src=\"./assets/scripts/gif.js\""),
  'editor does not load the local GIF encoder');
check(!source.includes('cdnjs.cloudflare.com/ajax/libs/gif.js'),
  'editor still depends on CDN gif.js');
check(source.includes("workerScript: './assets/scripts/gif.worker.js'"),
  'GIF export does not reference the local worker');
check(source.includes("a.download = 'output.gif'"),
  'GIF export filename is missing');
check(source.includes('id="exportOptimizedBtn"') &&
  source.includes('exportAnimatedWebP(true)') &&
  source.includes('experimental ? 150 : 300'),
  'experimental optimized GIF export is missing');
check(source.includes('requestAnimationFrame'), 'preview animation loop is missing');
check(source.includes('new GIF('), 'GIF encoder setup is missing');
check(source.includes('transparent: useBlackBackground ? null : 0x000000') &&
  source.includes('if (useBlackBackground)'),
  'GIF transparency and optional black background logic are missing');
check(source.includes('id="exportBlackBackground"') &&
  source.includes('transparent: useBlackBackground ? null : 0x000000') &&
  source.includes('captureFrameFast(useBlackBackground)'),
  'black-background export option is missing');
check(source.includes('<textarea id="textInput"'), 'multiline text input is missing');
check(source.includes('textContent') && source.includes('renderText'),
  'safe text rendering is missing');
check(!source.includes('textContainer.innerHTML'),
  'text rendering still uses innerHTML');
check(source.includes('if (a > 0)') && source.includes('result.data[i + 3] = a'),
  'alpha-aware opaque-pixel compositing is missing');
check(source.includes('id="invertMask"') &&
  source.includes('invertMask.checked') &&
  source.includes('255 - sourceAlpha'),
  'invert mask control does not invert the alpha mask');
check(source.includes('const a = maskAlpha') &&
  !source.includes('Math.max(maskAlpha, textureAlpha)'),
  'stable uploaded-image alpha masking was not restored');
check(source.includes('const textureWidth = Math.max') &&
  source.includes('const textureHeight = customPanelTextureHeight.checked') &&
  source.includes('const textureX = (canvasSize - textureWidth) / 2') &&
  source.includes('tempCtx.drawImage(') &&
  source.includes('textureWidth') &&
  source.includes('textureHeight') &&
  source.includes('placeholderTexture,') &&
  source.includes('textureWidth,') &&
  source.includes('textureHeight'),
  'panel texture does not use direct configured-rectangle filling');
check(source.includes('id="panelTextureWidth"') &&
  source.includes('id="customPanelTextureHeight"') &&
  source.includes('id="panelTextureHeight"') &&
  source.includes('customPanelTextureHeight.checked') &&
  source.includes('placeholderTexture,') &&
  source.includes('textureWidth,') &&
  source.includes('textureHeight'),
  'panel texture pixel dimension controls are missing');
check(!source.includes('id="textureOverflow"') &&
  !source.includes('id="textureOverflowRed"') &&
  !source.includes('overflowLayers'),
  'reverted texture overflow layers are still active');
check(source.includes('if (isRedElement && !isFinalTheme && !isGirlTheme)') &&
  source.includes("document.body.classList.contains('final-theme')") &&
  source.includes("(isFinalStyle && !isCustom) ? 'block' : 'none'"),
  'red layers are not explicitly disabled outside final styles');
check(source.includes('MAX_UPLOAD_BYTES') && source.includes('MAX_UPLOAD_PIXELS'),
  'upload limits are missing');
check(source.includes('URL.revokeObjectURL'), 'object URL cleanup is missing');
check(source.includes('id="editorStatus"') && source.includes('aria-live'),
  'editor status announcement is missing');
check(!source.includes('autoplay=1'), 'YouTube autoplay is still enabled');
check(!source.includes('<iframe'), 'redundant video iframe is still present');
check(source.includes('DELTARUNE © 2018-2026 Toby Fox'),
  'requested Toby Fox copyright notice is missing');
check(!source.includes('black-and-white') && !source.includes('monochrome'),
  'obsolete monochrome guidance is still present');
check(source.includes('<option value="girl">The Girl</option>'),
  'The Girl style option is missing');
check(source.includes("style === 'final' || style === 'girl'"),
  'The Girl style does not inherit final assets');
check(source.includes('brightness(1.35)') && source.includes('isGirlTheme'),
  'The Girl brightness overlay is missing');
check(source.includes("styleSelect.value === 'girl'") &&
  source.includes("'./assets/depth/depth-text.png'"),
  'The Girl style does not use the original prophecy texture');
check(source.includes('isGirlTheme ? 3.5 : 2') &&
  source.includes('isGirlTheme ? 5 : 2'),
  'The Girl afterframe motion is not widened and accelerated');
check(source.includes('pulseFinalRed 2s') &&
  source.includes('const phase = ((t - 1) % 2) / 2'),
  'The Final Prophecy timing was changed unexpectedly');
check(source.includes('t % (isGirlTheme ? 6 : 2)') &&
  source.includes("brightness(4) hue-rotate(25deg) saturate(0.72)"),
  'The Girl-only transition treatment is missing');
check(source.includes("brightness(4) hue-rotate(25deg) saturate(0.72)"),
  'The Girl white overlay is not bright enough');
check(source.includes('id="gifWidth"') && source.includes('id="gifHeight"'),
  'GIF size controls are missing');
check(source.includes('id="gifFrameBorder"') &&
  source.includes('getGifDimensions()') &&
  source.includes('width: gifWidth') &&
  source.includes('height: gifHeight'),
  'GIF dimensions are not connected to the export and preview border');
check(source.includes('id="gifPreviewArea"') &&
  source.includes('overflow: hidden') &&
  source.includes('previewArea.style.setProperty'),
  'GIF preview does not have an isolated bounded container');
check(source.includes('value="450"') && source.includes('value="300"') &&
  source.includes('aspect-ratio: 3 / 2') &&
  source.includes('inset: 0'),
  'GIF preview defaults or fixed viewport sizing are incorrect');
check(source.includes('#output') && source.includes('position: absolute') &&
  !source.includes('top: -50px'),
  'Legacy canvas offset can move rendered content outside the GIF frame');
check(source.includes('aspect-ratio: 3 / 2') &&
  source.includes('const imageY = 128 + yOffset') &&
  source.includes('(parseInt(gifYOffset.value, 10) || 0)'),
  'Background origin or GIF panel offset is not aligned with the panel');
check(source.includes('RENDER_WIDTH = 450') &&
  source.includes('RENDER_HEIGHT = 300') &&
  source.includes('checkRenderingAlignment'),
  'Unified renderer geometry check is missing');
check(source.includes('#textContainer {') &&
  source.includes('position: absolute') &&
  source.includes('#output') &&
  source.includes('inset: 0'),
  'Text and canvas are not sharing the same bounded composition frame');
check(source.includes('id="backgroundScale"') &&
  source.includes('backgroundScale.value') &&
  source.includes('backgroundScale.addEventListener'),
  'Background texture scale control is missing from the renderer');
check(source.includes('ctx.drawImage(bgCanvas, 0, 0)') &&
  source.includes('ctx.drawImage(panelCanvas, 0, 0)') &&
  !source.includes('canvasY - 25 - gifYOffset'),
  'GIF capture still applies a separate legacy canvas translation');
check(source.includes('const textY = 20') &&
  source.includes('transform-origin: center top'),
  'Preview and GIF text origins are not explicitly aligned');
check(!source.includes("fetch('./assets/scripts/license.key')"),
  'external license redirect is still active');
check(!source.includes('src="main/index.html"'),
  'standalone editor unexpectedly embeds GameMaker shell');

if (failures.length) {
  console.error('Standalone editor static checks failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Standalone editor static checks passed.');
}
