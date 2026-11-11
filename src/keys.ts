export interface ToyKey { label: string; keyboard: string; row: number; mask: number; symbol: string; vowel?: boolean; function?: boolean }
const action = (label: string, keyboard: string, row: number, mask: number, symbol: string): ToyKey => ({label,keyboard,row,mask,symbol,function:true});
export const KEYS: ToyKey[] = [
  action('Arrêt','F2',7,1,'ARRÊT'), action('Départ','1',7,2,'DÉPART'), action('Rejoue','2',7,4,'↶'), action('Répète','3',7,8,'Ⅱ'), action('Aide','4',7,16,'—'),
  action('Mot mystère','5',8,1,'?'), action('Code secret','6',8,2,'▮'), action('Lettre','7',8,4,'? ?'), action('Dis-le','8',8,8,'∴'), action('Épelle / Marche','9',8,16,'MARCHE'),
  ...[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((label,i) => ({label,keyboard:label.toLowerCase(),row:Math.floor(i/5),mask:1<<(i%5),symbol:label,vowel:'AEIOUY'.includes(label)})),
  {label:'Apostrophe',keyboard:"'",row:5,mask:2,symbol:"’"},
  action('Module','0',5,4,'#'), action('Efface','Backspace',5,8,'↖'), action('Essaie','Enter',5,16,'↵')
];
