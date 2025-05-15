let boxes = [];
let svg;
let hoverStartTime = 0; // 滑鼠懸停計時器

function preload() {
  // 使用 SVG 文件的完整網址（請將此處替換為您的實際網址）
  svg = loadShape("https://raw.githubusercontent.com/comet0101/q/main/2.svg");
}

function setup() {
  createCanvas(800, 800); // 調整畫布大小
  if (svg) {
    extractRects(svg); // 如果成功載入 SVG，解析矩形
  } else {
    console.error("SVG 未成功載入！");
  }
}

function draw() {
  background(225);

  // 更新並顯示所有方塊
  for (let b of boxes) {
    b.update();
    b.display();
  }

  // 檢查滑鼠懸停
  let hovering = false;
  for (let b of boxes) {
    if (b.contains(mouseX, mouseY)) {
      hovering = true;
      if (hoverStartTime === 0) {
        hoverStartTime = millis(); // 記錄懸停開始時間
      } else if (millis() - hoverStartTime > 100) { // 懸停超過 0.1 秒
        b.triggerRipple(mouseX, mouseY); // 觸發波紋效果
        hoverStartTime = 0; // 重置懸停計時
      }
      break; // 找到一個像素格後立即退出迴圈
    }
  }

  if (!hovering) {
    hoverStartTime = 0; // 如果滑鼠未懸停在任何像素格上，重置計時
  }
}

// 解析 SVG 並提取矩形
function extractRects(shape) {
  for (let i = 0; i < shape.getChildCount(); i++) {
    let child = shape.getChild(i);
    if (child.getKind() === "RECT") {
      let x = child.getParam("x") || 0;
      let y = child.getParam("y") || 0;
      let w = child.getParam("width") || 0;
      let h = child.getParam("height") || 0;
      let c = child.getFill(); // 取得原始填色

      boxes.push(new PixelBox(x, y, w, h, c));
    } else {
      extractRects(child); // 遞迴處理子形狀
    }
  }
}

// -------------------------------------
// 每個像素格物件
class PixelBox {
  constructor(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.originalColor = c || color(255); // 若無填充色則默認為白色
    this.currentColor = this.originalColor;
    this.rippleFrame = -1;
    this.triggered = false;
    this.rippleCenterX = 0;
    this.rippleCenterY = 0;
    this.rippleRadius = 0; // 波紋半徑
    this.rippleSpeed = 10; // 波紋擴散速度
    this.maxRippleRadius = 400; // 最大波紋半徑
  }

  triggerRipple(centerX, centerY) {
    this.rippleFrame = frameCount;
    this.triggered = true;
    this.rippleCenterX = centerX;
    this.rippleCenterY = centerY;
    this.rippleRadius = 0; // 重置波紋半徑
  }

  update() {
    if (this.triggered) {
      this.rippleRadius += this.rippleSpeed; // 波紋擴散
      if (this.rippleRadius > this.maxRippleRadius) {
        this.rippleRadius = 0; // 重置波紋半徑，但保持顏色
        this.triggered = false; // 停止波紋效果
      } else {
        // 計算與波紋中心的距離
        let distance = dist(this.rippleCenterX, this.rippleCenterY, this.x + this.w / 2, this.y + this.h / 2);
        if (distance < this.rippleRadius && distance > this.rippleRadius - this.rippleSpeed) {
          // 改變顏色，模擬波紋效果
          this.currentColor = color(random(150, 255), random(150, 255), random(255));
        }
      }
    }
  }

  display() {
    fill(this.currentColor);
    noStroke();
    rect(this.x, this.y, this.w, this.h);
  }

  contains(px, py) {
    return px >= this.x && px <= this.x + this.w && py >= this.y && py <= this.y + this.h;
  }
}