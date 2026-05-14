// ============================================================
// بيانات ولايات الجزائر مع أسعار ياليدين للتوصيل
// ============================================================

// نوعا التوصيل عند ياليدين
// home = توصيل للمنزل
// office = استلام من مكتب ياليدين (stop desk)

export const WILAYAS = [
  { code: '01', name: 'أدرار',           home: 600, office: 450 },
  { code: '02', name: 'الشلف',           home: 400, office: 300 },
  { code: '03', name: 'الأغواط',         home: 500, office: 400 },
  { code: '04', name: 'أم البواقي',      home: 400, office: 300 },
  { code: '05', name: 'باتنة',           home: 400, office: 300 },
  { code: '06', name: 'بجاية',           home: 400, office: 300 },
  { code: '07', name: 'بسكرة',           home: 450, office: 350 },
  { code: '08', name: 'بشار',            home: 600, office: 450 },
  { code: '09', name: 'البليدة',         home: 350, office: 250 },
  { code: '10', name: 'البويرة',         home: 350, office: 250 },
  { code: '11', name: 'تمنراست',         home: 700, office: 550 },
  { code: '12', name: 'تبسة',            home: 450, office: 350 },
  { code: '13', name: 'تلمسان',          home: 450, office: 350 },
  { code: '14', name: 'تيارت',           home: 400, office: 300 },
  { code: '15', name: 'تيزي وزو',        home: 350, office: 250 },
  { code: '16', name: 'الجزائر',         home: 300, office: 200 },
  { code: '17', name: 'الجلفة',          home: 450, office: 350 },
  { code: '18', name: 'جيجل',            home: 400, office: 300 },
  { code: '19', name: 'سطيف',            home: 400, office: 300 },
  { code: '20', name: 'سعيدة',           home: 450, office: 350 },
  { code: '21', name: 'سكيكدة',          home: 400, office: 300 },
  { code: '22', name: 'سيدي بلعباس',     home: 450, office: 350 },
  { code: '23', name: 'عنابة',           home: 400, office: 300 },
  { code: '24', name: 'قالمة',           home: 450, office: 350 },
  { code: '25', name: 'قسنطينة',         home: 400, office: 300 },
  { code: '26', name: 'المدية',          home: 350, office: 250 },
  { code: '27', name: 'مستغانم',         home: 400, office: 300 },
  { code: '28', name: 'المسيلة',         home: 450, office: 350 },
  { code: '29', name: 'معسكر',           home: 450, office: 350 },
  { code: '30', name: 'ورقلة',           home: 550, office: 400 },
  { code: '31', name: 'وهران',           home: 400, office: 300 },
  { code: '32', name: 'البيض',           home: 500, office: 400 },
  { code: '33', name: 'إليزي',           home: 700, office: 600 },
  { code: '34', name: 'برج بوعريريج',    home: 400, office: 300 },
  { code: '35', name: 'بومرداس',         home: 350, office: 250 },
  { code: '36', name: 'الطارف',          home: 450, office: 350 },
  { code: '37', name: 'تندوف',           home: 700, office: 600 },
  { code: '38', name: 'تيسمسيلت',        home: 450, office: 350 },
  { code: '39', name: 'الوادي',          home: 500, office: 400 },
  { code: '40', name: 'خنشلة',           home: 450, office: 350 },
  { code: '41', name: 'سوق أهراس',       home: 450, office: 350 },
  { code: '42', name: 'تيبازة',          home: 350, office: 250 },
  { code: '43', name: 'ميلة',            home: 400, office: 300 },
  { code: '44', name: 'عين الدفلى',      home: 350, office: 250 },
  { code: '45', name: 'النعامة',         home: 550, office: 400 },
  { code: '46', name: 'عين تموشنت',      home: 450, office: 350 },
  { code: '47', name: 'غرداية',          home: 550, office: 400 },
  { code: '48', name: 'غليزان',          home: 400, office: 300 },
  { code: '49', name: 'تيميمون',         home: 600, office: 450 },
  { code: '50', name: 'برج باجي مختار',  home: 700, office: 600 },
  { code: '51', name: 'أولاد جلال',      home: 500, office: 400 },
  { code: '52', name: 'بني عباس',        home: 650, office: 500 },
  { code: '53', name: 'عين صالح',        home: 700, office: 550 },
  { code: '54', name: 'عين قزام',        home: 700, office: 600 },
  { code: '55', name: 'تقرت',            home: 500, office: 400 },
  { code: '56', name: 'جانت',            home: 700, office: 600 },
  { code: '57', name: 'المغير',          home: 550, office: 400 },
  { code: '58', name: 'المنيعة',         home: 600, office: 450 },
]

// طرق الدفع المتاحة
export const PAYMENT_METHODS = [
  { value: 'cash_on_delivery', label: 'الدفع عند الاستلام', icon: '💵', desc: 'تدفع نقداً عند استلام طلبك' },
  { value: 'baridimob',        label: 'بريدي موب',           icon: '📱', desc: 'دفع إلكتروني عبر تطبيق بريدي موب / CCP' },
]

// أنواع التوصيل
export const DELIVERY_TYPES = {
  home:   { label: 'توصيل للمنزل',         icon: '🏠', desc: 'يصلك الطلب إلى باب منزلك' },
  office: { label: 'استلام من المكتب',      icon: '🏢', desc: 'استلم من أقرب نقطة ياليدين' },
}
