export interface MenuItem {
  name: string;
  price: number | null; // null = po dogovoru / market price
  description?: string;
}

export interface MenuCategory {
  id: string;
  label: string;
  emoji: string;
  items: MenuItem[];
}

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 'kava',
    label: 'Kava i topli napici',
    emoji: '☕',
    items: [
      { name: 'Espresso',          price: 1.20 },
      { name: 'Dupli espresso',    price: 1.80 },
      { name: 'Macchiato',         price: 1.30 },
      { name: 'Cappuccino',        price: 1.80 },
      { name: 'Latte macchiato',   price: 2.20 },
      { name: 'Bijela kava',       price: 1.80 },
      { name: 'Čaj',               price: 1.50 },
      { name: 'Kakao',             price: 2.00 },
      { name: 'Topla čokolada',    price: 2.50 },
    ],
  },
  {
    id: 'bezalkoholna',
    label: 'Bezalkoholna pića',
    emoji: '🥤',
    items: [
      { name: 'Coca-Cola 0.33 l',  price: 2.20 },
      { name: 'Fanta 0.33 l',      price: 2.20 },
      { name: 'Sprite 0.33 l',     price: 2.20 },
      { name: 'Nestea 0.5 l',      price: 2.50 },
      { name: 'Cedevita',          price: 1.80 },
      { name: 'Sok od naranče',    price: 2.00 },
      { name: 'Sok od jabuke',     price: 2.00 },
      { name: 'Multivitamin sok',  price: 2.00 },
      { name: 'Ledeni čaj',        price: 2.00 },
      { name: 'Energetski napitak',price: 3.00 },
      { name: 'Voda 0.33 l',       price: 1.20 },
      { name: 'Voda 0.5 l',        price: 1.50 },
      { name: 'Gazirana voda 0.5 l', price: 1.80 },
    ],
  },
  {
    id: 'pivo',
    label: 'Pivo',
    emoji: '🍺',
    items: [
      { name: 'Točeno pivo 0.3 l', price: 1.80 },
      { name: 'Točeno pivo 0.5 l', price: 2.80 },
      { name: 'Karlovačko 0.5 l',  price: 2.50 },
      { name: 'Ožujsko 0.5 l',     price: 2.50 },
      { name: 'Heineken 0.33 l',   price: 3.00 },
      { name: 'Pivo bez alkohola 0.5 l', price: 2.50 },
    ],
  },
  {
    id: 'vino',
    label: 'Vino i žestoka pića',
    emoji: '🍷',
    items: [
      { name: 'Crno vino dl',      price: 1.80 },
      { name: 'Bijelo vino dl',    price: 1.80 },
      { name: 'Rosé vino dl',      price: 2.00 },
      { name: 'Šampanjac',         price: 4.00 },
      { name: 'Rakija (šljivovica)', price: 2.00 },
      { name: 'Rakija (travarica)', price: 2.00 },
      { name: 'Whiskey',           price: 4.00 },
      { name: 'Gin & Tonic',       price: 5.00 },
      { name: 'Aperol Spritz',     price: 5.50 },
    ],
  },
  {
    id: 'hrana',
    label: 'Hrana i grickalice',
    emoji: '🥪',
    items: [
      { name: 'Sendvič sa šunkom i sirom', price: 3.50 },
      { name: 'Sendvič s tunom',    price: 4.00 },
      { name: 'Tost',               price: 2.50 },
      { name: 'Kroasan s marmeladom', price: 2.00 },
      { name: 'Burek (pola kg)',    price: 3.00 },
      { name: 'Čips',               price: 1.50 },
      { name: 'Kikiriki',           price: 1.20 },
      { name: 'Kokice',             price: 1.50 },
      { name: 'Čokoladna pločica', price: 1.50 },
    ],
  },
  {
    id: 'sladoled',
    label: 'Sladoled i deserti',
    emoji: '🍦',
    items: [
      { name: 'Sladoled jedna lopta', price: 1.20 },
      { name: 'Sladoled dvije lopte', price: 2.00 },
      { name: 'Sladoled tri lopte',  price: 2.80 },
      { name: 'Palačinka s Nutellom', price: 3.00 },
      { name: 'Palačinka s džemom',  price: 2.50 },
      { name: 'Brownie',             price: 3.00 },
    ],
  },
];
