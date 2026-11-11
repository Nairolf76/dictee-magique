// MAME bits: perimeter 0..5, middle halves 6..7, centre verticals 8..9,
// diagonals bottom-left/top-left/top-right/bottom-right 10..13, DP 14, AP 15.
// Original SVG geometry, driven exclusively by the emulated PWM segment masks.
const segments = [
  '12,6 48,6 53,10 48,14 12,14 7,10',
  '49,17 54,12 58,17 54,44 49,48 46,43',
  '48,56 53,51 57,56 53,83 48,88 45,83',
  '9,87 45,87 50,91 45,95 9,95 4,91',
  '3,56 8,51 12,56 8,83 3,88 0,83',
  '7,17 12,12 16,17 12,44 7,48 4,43',
  '12,47 27,47 29,51 26,55 11,55 7,51',
  '31,47 46,47 50,51 45,55 30,55 28,51',
  '29,17 33,17 31,44 28,47 26,44',
  '27,58 31,57 29,84 25,84',
  '21,58 25,57 24,62 13,83 10,81',
  '15,18 20,20 28,43 26,46 22,43',
  '45,18 48,20 37,44 33,47 32,43',
  '33,58 37,58 45,81 42,84 39,80',
  '54,88 60,88 60,95 54,95',
  '55,2 60,2 57,12 53,12'
];
export class SegmentDisplay {
  private digits: SVGPolygonElement[][] = [];
  readonly masks = new Array<number>(8).fill(0);
  constructor(container: HTMLElement) {
    for (let i=0;i<8;i++) {
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 0 64 101'); svg.setAttribute('aria-hidden','true');
      this.digits.push(segments.map(points=>{
        const segment=document.createElementNS(svg.namespaceURI,'polygon') as SVGPolygonElement;
        segment.setAttribute('points',points); svg.append(segment); return segment;
      })); container.append(svg);
    }
  }
  update(index: number, mask: number) {
    if (index<0 || index>7) return;
    this.masks[index]=mask;
    this.digits[index].forEach((element,bit)=>element.classList.toggle('lit',!!(mask&(1<<bit))));
  }
}
