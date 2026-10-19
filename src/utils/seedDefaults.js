import bcrypt from 'bcryptjs';
import { WebsiteSettings } from '../models/WebsiteSettings.js';
import { BirthdayLetter } from '../models/BirthdayLetter.js';
import { DuaCard } from '../models/DuaCard.js';
import { Memory } from '../models/Memory.js';
import { AdminUser } from '../models/AdminUser.js';
import { config } from '../config/index.js';

export async function seedDefaults() {
  console.log('[Seed] Checking and seeding defaults in MongoDB...');

  // 1. Website Settings
  const existingSettings = await WebsiteSettings.findOne();
  if (!existingSettings) {
    await WebsiteSettings.create({
      brotherName: 'Kareem Bhai',
      mainHeading: 'JANAMDIN MUBARAK, BHAI JAAN ❤️',
      introGreeting: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      introSubheading: 'Mere azeez, muhtaram aur rehnuma bhai ke naam ek dil-se tohfa',
      heroTagline: 'Duaon, Mohabbat aur Qadardani se bhara ek pyara safar',
      signOff: 'Aapke Chhote Bhai Ki Taraf Se ❤️',
      metaTitle: 'JANAMDIN MUBARAK, BHAI JAAN ❤️',
      metaDescription: 'Kareem Bhai ke janamdin par duaon aur yaadon ka ek pyara tohfa.',
      themePrimary: '#047857',
      themeSecondary: '#d4af37',
      themeBgDark: '#022c22',
      enableParticles: true,
      enableLanterns: true,
      enableNasheed: true,
      enableLetter: true,
      enableDuas: true,
      enableGallery: true,
      enableMemories: true,
      enableVideo: true
    });
    console.log('[Seed] Created default WebsiteSettings.');
  }

  // 2. Birthday Letter
  const existingLetter = await BirthdayLetter.findOne();
  if (!existingLetter) {
    await BirthdayLetter.create({
      title: 'Mere Pyare Aur Azeez Bhai Jaan Ke Naam',
      salutation: 'Assalamu Alaikum Wa Rahmatullahi Wa Barakatuh, Pyare Kareem Bhai,',
      paragraphs: [
        "Mere pyare aur muhtaram Bhai Jaan, aaj ke is ba-barkat din par main Allah Ta'ala ka be-hisaab shukr ada karta hoon jisne mujhe aap jaisa nek, mukhlis aur shafiq elder brother ata farmaya.",
        "Aap mere liye sirf ek bhai nahi, balki mere sabse bade rehnuma, meri taqat aur meri himmat hain. Bachpan se lekar aaj tak, aapne hamesha mera haath thaama, har mushkil mein mujhe sahara diya aur hamesha sahi raaste ki rehnumai ki.",
        "Zindagi ke har mod par aapka saya mere sar par ek hifazat ki dhaal ki tarah raha hai. Aapki mehnat, aapka sabr aur aapka azeem kirdar mere liye hamesha ek roshan misaal hai.",
        "Meri dili dua hai ke Allah Ta'ala aapki umr mein be-shumaar barkat ata farmaye, aapko hamesha tandurust aur khushhaal rakhe, aapke rizq mein kushadgi ata farmaye aur aapke har jaayez maqsad mein azeem kamyabi naseeb farmaye.",
        "Allah Ta'ala jald az jald aapko aur hum sab ko ek saath Baithullah Sharif aur Roza-e-Rasool ﷺ ki ba-adab ziyarat, Umrah aur Hajj-e-Mabrur ki sa'adat naseeb farmaye. Aameen Ya Rabbal Aalameen!"
      ],
      closingDua: "Allah Ta'ala aap par hamesha apni khas rehmaton aur barkaton ka nuzool farmaye, aur hamara yeh bhai-bhai ka rishta duniya aur aakhirat dono mein salamat wa sarfaraz rakhe.",
      signOff: 'Aapke Chhote Bhai Ki Taraf Se ❤️'
    });
    console.log('[Seed] Created default BirthdayLetter.');
  }

  // 3. Dua Cards (7 authentic cards)
  const duaCount = await DuaCard.countDocuments();
  if (duaCount === 0) {
    const defaultDuas = [
      {
        title: 'Sehat aur Barkat Wali Zindagi',
        arabicText: 'اَللّٰهُمَّ عَافِنِيْ فِيْ بَدَنِيْ، اَللّٰهُمَّ عَافِنِيْ فِيْ سَمْعِيْ، اَللّٰهُمَّ عَافِنِيْ فِيْ بَصَرِيْ',
        urduText: 'Ya Allah! Mere pyare bhai jaan ko kamil wa daaimi sehat, afiyat aur aisi lambi, ba-barkat zindagi ata farma jo Teri raza aur ibadat se sarshar ho.',
        englishMeaning: 'O Allah! Bless my elder brother with enduring vitality, complete health, and a long life full of righteousness and divine grace.',
        category: 'Sehat & Afiyat',
        sortOrder: 1,
        isPublished: true,
        aameenCount: 18
      },
      {
        title: 'Sukoon aur Khushiyan',
        arabicText: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ',
        urduText: 'Ya Rabbe Kareem! Bhai jaan ke dil ko har gham aur fikar se paak farma, unki zindagi mein daaimi sukoon, itminaan aur muskurahatein bhar de.',
        englishMeaning: 'O Allah! Fill his heart with deep peace, tranquility, and contentment, and keep every grief far away from his life.',
        category: 'Sukoon',
        sortOrder: 2,
        isPublished: true,
        aameenCount: 22
      },
      {
        title: 'Halal Rizq aur Kamyabi',
        arabicText: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا',
        urduText: 'Ya Razzaaq! Bhai jaan ke rizq mein be-inteha barkat aur kushadgi ata farma, unke har jaayez kaam mein azeem taraqqi aur kamyabi naseeb farma.',
        englishMeaning: 'O The Provider! Bestow upon him vast and blessed halal sustenance, and grant him outstanding triumph and honor in every pursuit.',
        category: 'Rizq & Kamyabi',
        sortOrder: 3,
        isPublished: true,
        aameenCount: 27
      },
      {
        title: 'Maa-Baap Ki Khidmat aur Family Ki Khushiyan',
        arabicText: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
        urduText: 'Ya Allah! Bhai jaan ko walidain ki khidmat aur unki duaen lene ki azeem sa\'adat ata farma, aur hamari poori family mein hamesha ittifaq aur mohabbat qaim rakh.',
        englishMeaning: 'O Allah! Enable him to serve parents with utmost devotion, and envelope our entire family in boundless love, unity, and harmony.',
        category: 'Family & Walidain',
        sortOrder: 4,
        isPublished: true,
        aameenCount: 20
      },
      {
        title: 'Allah Ki Hifazat aur Rehmat',
        arabicText: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
        urduText: 'Ya Hafeez! Mere bhai jaan ko har buri nazar, shar, hasad aur aalam-e-bala se apni panah mein rakh, aur unpar apni rehmaton ki barish farma.',
        englishMeaning: 'O Protector! Guard my brother beneath Your divine refuge from all evil, jealousy, and calamities, showering him with Your mercy.',
        category: 'Hifazat & Rehmat',
        sortOrder: 5,
        isPublished: true,
        aameenCount: 31
      },
      {
        title: 'Umrah aur Hajj Ki Sa\'adat',
        arabicText: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ',
        urduText: 'Ya Rabb! Bhai jaan ko jald az jald Haramain Sharifain ki ba-adab ziyarat, maqbool Umrah aur Hajj-e-Mabrur ki mubarak sa\'adat naseeb farma.',
        englishMeaning: 'O Allah! Blessed are those who visit Your sacred House; grant him accepted Umrah and Hajj in Makkah and Madinah with high honors.',
        category: 'Hajj & Umrah',
        sortOrder: 6,
        isPublished: true,
        aameenCount: 35
      },
      {
        title: 'Duniya aur Aakhirat Ki Bhalai',
        arabicText: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        urduText: 'Ya Allah! Bhai jaan ko duniya ki har bhalai aur aakhirat mein Aala Darjaat, Jannat-ul-Firdaus aur Nabi Kareem ﷺ ka pados ata farma.',
        englishMeaning: 'Our Lord! Bestow upon him goodness in this world and the Hereafter, and grant him Jannat-ul-Firdaus.',
        category: 'Maghfirat & Jannat',
        sortOrder: 7,
        isPublished: true,
        aameenCount: 42
      }
    ];

    await DuaCard.insertMany(defaultDuas);
    console.log('[Seed] Created 7 default DuaCards.');
  }

  // 4. Default Memories
  const memCount = await Memory.countDocuments();
  if (memCount === 0) {
    const defaultMemories = [
      {
        title: 'Bachpan Ka Saya aur Shafqat',
        description: 'Bachpan ke wo din jab aapne hamesha meri har zid aur khushi ka khayal rakha aur ek azeem bade bhai ka kirdar nibhaya.',
        dateOrPeriod: 'Bachpan Ke Ayyam',
        iconName: 'heart',
        sortOrder: 1,
        isPublished: true
      },
      {
        title: 'Mera Pehla Rehnuma aur Teacher',
        description: 'School ho ya zindagi ke ahem faisle, aapne hamesha sabse behtareen mashwara diya aur aage badhne ki himmat bakhshi.',
        dateOrPeriod: 'Taleem aur Rehnumai',
        iconName: 'book',
        sortOrder: 2,
        isPublished: true
      },
      {
        title: 'Mushkil Lamhaat Ki Mazboot Dhaal',
        description: 'Jab bhi zindagi mein koi pareshani aayi, aapne bina kisi shikayat ke aage aakar har mushkil ko aasan bana diya.',
        dateOrPeriod: 'Har Mod Par Sath',
        iconName: 'shield',
        sortOrder: 3,
        isPublished: true
      },
      {
        title: 'Kamyabiyon Ki Mushtarka Khushi',
        description: 'Meri har chhoti-badi kamyabi par mujhse zyada aapka chehra chamka aur aapki duaon ne har mod par raste khole.',
        dateOrPeriod: 'Alhamdulillah',
        iconName: 'sparkles',
        sortOrder: 4,
        isPublished: true
      }
    ];

    await Memory.insertMany(defaultMemories);
    console.log('[Seed] Created default Memories.');
  }

  // 5. Initial Admin Account
  const adminCount = await AdminUser.countDocuments();
  if (adminCount === 0) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(config.initialAdmin.password, salt);
    await AdminUser.create({
      username: config.initialAdmin.username,
      passwordHash,
      role: 'superadmin'
    });
    console.log(`[Seed] Created initial administrator: username="${config.initialAdmin.username}"`);
  }

  console.log('[Seed] Defaults verified and seeded.');
}
