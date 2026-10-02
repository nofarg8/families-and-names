const LABELS: [string, string][] = [
  ['he.wikipedia', 'ויקיפדיה'],
  ['ru.wikipedia', 'ויקיפדיה ברוסית'],
  ['wikipedia', 'ויקיפדיה באנגלית'],
  ['stmegi', 'קרן STMEGI של יהודי ההרים'],
  ['gorskie.ru', 'אתר יהודי ההרים gorskie.ru'],
  ['mdpi.com', 'מחקר של אלכסנדר ביידר על שמות יהודי גאורגיה'],
  ['iranicaonline', 'אנציקלופדיה איראניקה'],
  ['anumuseum', 'אנו - מוזיאון העם היהודי'],
  ['chabad', 'חב״ד'],
  ['aish', 'אש התורה'],
  ['jewishvirtuallibrary', 'הספרייה היהודית הווירטואלית'],
  ['yivo', 'אנציקלופדיית ייבו'],
  ['encyclopedia.com', 'אנציקלופדיה יודאיקה'],
  ['avotaynu', 'כתב העת אבוטיינו'],
  ['ucsb.edu', 'כתב העת אבוטיינו'],
  ['ravmilim', 'רוביק רוזנטל, הזירה הלשונית'],
  ['israelhayom', 'ישראל היום'],
  ['ynet', 'ynet'],
  ['isragen', 'העמותה הישראלית לגנאלוגיה'],
  ['haaretz', 'הארץ'],
  ['myheritage', 'MyHeritage'],
  ['rfpeurope', 'מחקר על שמות יהודי בולגריה'],
]

/** Friendly Hebrew name of a source site. */
export function sourceLabel(url: string): string {
  let host = url
  try {
    host = new URL(url).hostname.replace(/^www\./, '')
  } catch {
    // keep the raw string
  }
  return LABELS.find(([key]) => host.includes(key))?.[1] ?? host
}
