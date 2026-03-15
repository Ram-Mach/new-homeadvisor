<template>
  <!-- Hero -->
  <v-row justify="center" class="mt-6 mb-2">
    <v-col cols="12" md="9" lg="7" class="text-center">
      <v-icon size="80" color="primary" class="mb-4">mdi-home-city-outline</v-icon>
      <h1 class="text-h3 font-weight-bold mb-3">ברוכים הבאים להום אדוויזור</h1>
      <p class="text-subtitle-1 text-medium-emphasis mb-8">
        הפלטפורמה הפרטית המקיפה לניהול פרויקטי שיפוץ ובנייה — מתכנון ראשוני ועד מסירה ובקרת איכות.
      </p>
      <div class="d-flex flex-wrap justify-center ga-3">
        <v-btn color="primary" size="large" rounded="xl" :to="{ name: 'register' }">
          התחילו בחינם
          <v-icon end>mdi-arrow-left</v-icon>
        </v-btn>
        <v-btn variant="outlined" color="primary" size="large" rounded="xl" :to="{ name: 'login' }">
          התחברות
        </v-btn>
        <v-btn variant="text" color="primary" size="large" rounded="xl" :to="{ name: 'org-dashboard' }">
          לדשבורד
        </v-btn>
      </div>
    </v-col>
  </v-row>

  <v-divider class="my-10" />

  <!-- Stats bar -->
  <v-row justify="center" class="mb-10">
    <v-col v-for="stat in stats" :key="stat.label" cols="6" sm="3" class="text-center">
      <div class="text-h4 font-weight-bold" :style="{ color: `rgb(var(--v-theme-primary))` }">{{ stat.value }}</div>
      <div class="text-body-2 text-medium-emphasis">{{ stat.label }}</div>
    </v-col>
  </v-row>

  <v-divider class="mb-10" />

  <!-- Feature groups -->
  <div v-for="group in featureGroups" :key="group.title" class="mb-12">
    <v-row justify="center" class="mb-4">
      <v-col cols="12" md="9">
        <div class="d-flex align-center ga-2 mb-1">
          <v-icon :icon="group.icon" color="primary" size="24" />
          <span class="text-overline font-weight-bold">{{ group.category }}</span>
        </div>
        <div class="text-h5 font-weight-bold">{{ group.title }}</div>
        <div class="text-body-2 text-medium-emphasis mt-1">{{ group.subtitle }}</div>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" md="9">
        <v-row>
          <v-col
            v-for="feature in group.features"
            :key="feature.title"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card elevation="1" class="pa-5 h-100">
              <v-icon :icon="feature.icon" color="primary" size="32" class="mb-3" />
              <div class="text-subtitle-1 font-weight-bold mb-1">{{ feature.title }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ feature.description }}</div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>

  <v-divider class="my-10" />

  <!-- Bottom CTA -->
  <v-row justify="center" class="mb-10">
    <v-col cols="12" md="7" class="text-center">
      <div class="text-h5 font-weight-bold mb-3">מוכנים להתחיל?</div>
      <div class="text-body-1 text-medium-emphasis mb-6">
        הצטרפו אלינו וקחו שליטה מלאה על פרויקט השיפוץ שלכם.
      </div>
      <v-btn color="primary" size="x-large" rounded="xl" :to="{ name: 'register' }">
        יצירת חשבון חינם
        <v-icon end>mdi-arrow-left</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
const stats = [
  { value: '13+', label: 'מודולים לניהול' },
  { value: '6', label: 'סוגי משתמשים' },
  { value: '100%', label: 'בעברית ו-RTL' },
  { value: '∞', label: 'פרויקטים' },
];

const featureGroups = [
  {
    category: 'תכנון',
    icon: 'mdi-map-marker-path',
    title: 'תכנון הפרויקט מהיום הראשון',
    subtitle: 'צרו את הפרויקט בצורה מובנית עם מתכנן חכם שמייצר כתב כמויות אוטומטי.',
    features: [
      {
        icon: 'mdi-map-marker-path',
        title: 'מתכנן פרויקט',
        description: 'אשף 3 שלבים: שם פרויקט, בחירת אזורים, וכתב כמויות ראשוני אוטומטי.',
      },
      {
        icon: 'mdi-view-dashboard-outline',
        title: 'דשבורד ארגוני',
        description: 'סקירה של כל הפרויקטים הפעילים, חברי הצוות, תקציב כולל ואירועים אחרונים.',
      },
      {
        icon: 'mdi-home-analytics',
        title: 'דשבורד פרויקט',
        description: 'מצב הפרויקט, אחוז ביצוע לפי שלב, רשימת משימות ואנשי הצוות.',
      },
    ],
  },
  {
    category: 'כספים',
    icon: 'mdi-cash-multiple',
    title: 'שליטה מלאה בתקציב',
    subtitle: 'נהלו תקציב, הוצאות וכתב כמויות — הכל בזמן אמת.',
    features: [
      {
        icon: 'mdi-cash-multiple',
        title: 'ניהול תקציב',
        description: 'הגדרת קטגוריות תקציב עם מעקב ביצוע, פס התקדמות ועדכון בזמן אמת.',
      },
      {
        icon: 'mdi-receipt-text-outline',
        title: 'מעקב הוצאות',
        description: 'רשומות הוצאות ניתנות לחיפוש וסינון, עם הוספה מהירה מתוך הפרויקט.',
      },
      {
        icon: 'mdi-format-list-bulleted-square',
        title: 'כתב כמויות (BOQ)',
        description: 'ניהול סעיפים, כמויות ומחירי יחידה עם סיכום כולל ועריכה שורה-שורה.',
      },
    ],
  },
  {
    category: 'ספקים וגיוס',
    icon: 'mdi-gavel',
    title: 'ניהול הצעות מחיר',
    subtitle: 'שלחו קישור ציבורי לקבלנים, אספו הצעות והשוו — ללא מיילים.',
    features: [
      {
        icon: 'mdi-gavel',
        title: 'השוואת הצעות מחיר',
        description: 'כרטיסי הצעה עם תג "מומלץ", אישור הצעה וצפייה בפירוט.',
      },
      {
        icon: 'mdi-send-outline',
        title: 'קישור ציבורי לקבלן',
        description: 'שליחת לינק ייחודי לכל קבלן — ממלאים מחירים על כתב הכמויות ישירות.',
      },
      {
        icon: 'mdi-cart-variant',
        title: 'רשימת קניות',
        description: 'ניהול פריטי חומר לבן ורכישות אחרות עם סטטוס לכל פריט וסיכום עלויות.',
      },
    ],
  },
  {
    category: 'צוות ותקשורת',
    icon: 'mdi-account-group-outline',
    title: 'שיתוף פעולה בצוות',
    subtitle: 'כולם על אותו עמוד — בעל הבית, מעצב, אדריכל וקבלן.',
    features: [
      {
        icon: 'mdi-account-group-outline',
        title: 'ניהול צוות ארגוני',
        description: 'ניהול חברי הצוות ברמת הארגון עם הקצאת תפקידים וסטטוס.',
      },
      {
        icon: 'mdi-account-multiple-outline',
        title: 'צוות פרויקט',
        description: 'הזמנה, עריכה והסרה של חברים ברמת הפרויקט הספציפי.',
      },
      {
        icon: 'mdi-forum-outline',
        title: "צ'אט פרויקט",
        description: 'שיחה מובנית עם כל הצוות בתוך הפרויקט, ללא יציאה לאפליקציה חיצונית.',
      },
    ],
  },
  {
    category: 'ניהול ביצוע',
    icon: 'mdi-tools',
    title: 'ביצוע ובקרה',
    subtitle: 'מעקב לוחות זמנים, בקרת איכות וניהול כלל הקבצים בפרויקט.',
    features: [
      {
        icon: 'mdi-timeline-clock-outline',
        title: 'לוח זמנים',
        description: 'תצוגת שלבים עם פסי ביצוע ואבני דרך, לניהול ציפיות וסדר עדיפויות.',
      },
      {
        icon: 'mdi-clipboard-check-outline',
        title: 'בקרת איכות',
        description: 'רשימות בדיקה לפי שלב — מאשרים כל שלב לפני מעבר לבא אחריו.',
      },
      {
        icon: 'mdi-folder-multiple-outline',
        title: 'ניהול קבצים',
        description: 'העלאת קבצים, יצירת תיקיות, חיפוש וסינון לפי סוג קובץ.',
      },
    ],
  },
];
</script>
