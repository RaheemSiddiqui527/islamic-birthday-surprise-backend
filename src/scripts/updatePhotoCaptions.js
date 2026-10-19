import { connectDB, disconnectDB } from '../config/database.js';
import { Photo } from '../models/Photo.js';

// 80 carefully curated, deeply emotional, respectful and heartfelt captions & descriptions
// for Kareem Bhai (Bhai Jaan) from his younger brother.
const captionsLibrary = [
  {
    caption: 'Mere Rahnuma, Mere Kareem Bhai ❤️',
    description: 'Aap mere liye sirf bade bhai nahi, balke zindagani ke har mod par mere sabse bade rehnuma aur dost hain.',
    date: 'Khoobsurat Yaadgaar Lamha'
  },
  {
    caption: 'Bhai Jaan Ki Pur-Waqar Shakhsiyat ⭐',
    description: 'Aapka sanjeeda aur shafiq andaaz hamare poore khandan ka fakhr aur ghar ki raunaq hai.',
    date: 'Bhai Jaan Ka Andaaz'
  },
  {
    caption: 'Aapki Muskaan, Hamare Ghar Ka Sukoon 😊',
    description: 'Rab Ta\'ala aapke chehre par yeh pakeeza muskurahat ta-umr qaim wa daaim rakhe. Ameen!',
    date: 'Barkat Bhari Muskaan'
  },
  {
    caption: 'Bhai-Bhai Ka Attot Rishta 🤝',
    description: 'Duniya ki koi taaqat us mohabbat aur bharose ko kamzor nahi kar sakti jo Allah ne hum dono ke darmiyan banaya hai.',
    date: 'Bhai-Bhai Ki Mohabbat'
  },
  {
    caption: 'Hamesha Mera Hausla Badhane Wale 🌟',
    description: 'Jab bhi zindagi mein koi mushkil aayi, aapka ek muskurata hua chehra aur tassalli bhara haath kaafi tha.',
    date: 'Hosla Aur Himmat'
  },
  {
    caption: 'Rehmat Aur Barkat Ka Saya 🤲',
    description: 'Bade bhai ka sar par saya hona Allah Ta\'ala ki un azeem naimaton mein se hai jiska shukr ada nahi ho sakta.',
    date: 'Rab Ki Azeem Naimat'
  },
  {
    caption: 'Kareem Bhai Ki Shafqat Aur Muhabbat ❤️',
    description: 'Aapne hamesha chhote bhai ko apni chhaon mein rakha, har khushi aage badh kar ata ki.',
    date: 'Bhai Jaan Ki Shafqat'
  },
  {
    caption: 'Ek Behtareen Dost Aur Murshid 📖',
    description: 'Aapki baatein, aapki samajh aur aapki nasihat hamesha meri rahnumai karti hain.',
    date: 'Nasihat Aur Rehnumai'
  },
  {
    caption: 'Bhai Jaan Ki Haseen Muskurahat ✨',
    description: 'Aapki hansi dekh kar dil ko jo itminan milta hai, use lafzon mein bayaan karna na-mumkin hai.',
    date: 'Dilkash Lamhaat'
  },
  {
    caption: 'Ghar Ki Shaan, Bhai Jaan 👑',
    description: 'Aapki maujoodgi se ghar ka aangan roshan rehta hai aur sab ke dilon mein thandak rehti hai.',
    date: 'Ghar Ki Raunaq'
  },
  {
    caption: 'Rab Aapko Har Nazar-e-Bad Se Bachaye 🛡️',
    description: 'Meri har namaz ke baad yahi dua rehti hai ke Allah mere bhai ko har shar aur buri nazar se apni hifazat mein rakhe.',
    date: 'Dua-e-Hifazat'
  },
  {
    caption: 'Bhai-Bhai Ka Sacha Pyar ❤️',
    description: 'Lafz kam pad jaate hain aapke liye meri mohabbat aur ahtiram ko bayaan karne ke liye, Bhai Jaan.',
    date: 'Sachi Mohabbat'
  },
  {
    caption: 'Aapka Ehtiram, Mera Fakhr Hai 🌟',
    description: 'Aapka chhota bhai kehlaane par mujhe hamesha fakhr aur naaz raha hai aur hamesha rahega.',
    date: 'Fakhr Aur Naaz'
  },
  {
    caption: 'Bhai Jaan Ka Narm Aur Pur-Khuloos Dil 💖',
    description: 'Aapki narmi aur khuloos har kisi ke dil ko jeet leta hai. Allah aapko hamesha khush rakhe.',
    date: 'Khuloos-e-Niyyat'
  },
  {
    caption: 'Ek Yaadgaar Sham Bhai Jaan Ke Sang 🌙',
    description: 'Aapke sath guzra har ek pal zindagi ki sabse haseen aur keemti yaadon ka hissa ban jata hai.',
    date: 'Haseen Guftagu'
  },
  {
    caption: 'Aap Mere Sabse Bade Hero Hain 🏆',
    description: 'Zindagi jeene ka saleeqa aur mushkilaat ka samna karna maine hamesha aap hi se seekha hai.',
    date: 'Ideal Personality'
  },
  {
    caption: 'Sehat Aur Afiyat Ki Dua 🤲',
    description: 'Ya Allah, mere pyaare Kareem Bhai ko kamil sehat, tandrusti aur azeem barkaton wali zindagi ata farma.',
    date: 'Dua-e-Sehat'
  },
  {
    caption: 'Bhai Jaan Ki Roshan Qayadat 💫',
    description: 'Har faislay mein aapki door-andeshi aur hikmat hum sab ke liye ek mashal-e-raah hai.',
    date: 'Hikmat Aur Danish'
  },
  {
    caption: 'Khushiyon Bhara Safar ✨',
    description: 'Bhai jaan ke sath zindagi ka har safar aasan, pur-lutf aur duaon ke saye mein guzarta hai.',
    date: 'Yaadgaar Safar'
  },
  {
    caption: 'Dil Se Nikli Dua Aapke Naam ❤️',
    description: 'Allah Ta\'ala aapki har jaiz khwahish ko poora farmaye aur aapko dono jahan ki kamyabi ata farmaye.',
    date: 'Khas Dua'
  },
  {
    caption: 'Bhai Jaan Ka Saath — Zindagi Ka Sukoon 🌿',
    description: 'Jab aap paas hote hain to kisi cheez ki fikar nahi hoti. Aap hamari taqat hain.',
    date: 'Sukoon-e-Qalb'
  },
  {
    caption: 'Pakeeza Akhlaq Ke Malik 💎',
    description: 'Aapka meetha lehja aur husn-e-akhlaq har kisi ko aapka giraweeda bana leta hai.',
    date: 'Husn-e-Akhlaq'
  },
  {
    caption: 'Bachpan Se Aaj Tak Ka Pyar 🎈',
    description: 'Bachpan ki un ungli pakad kar chalne ki yaadon se lekar aaj tak, aapne hamesha mera khyal rakha.',
    date: 'Bachpan Ki Yaadein'
  },
  {
    caption: 'Allah Aapke Rizq Mein Barkat Dale 💰',
    description: 'Kareem Bhai ke halal rizq, karobar aur har nek maqsad mein rab azeem barkatein ata farmaye.',
    date: 'Barkat-e-Rizq'
  },
  {
    caption: 'Bhai Jaan Ki Muskurahat Ka Jadoo ✨',
    description: 'Aapki muskurahat mein wo jaadu hai jo thakan aur udasi ko pal bhar mein door kar deta hai.',
    date: 'Khush-Dili'
  },
  {
    caption: 'Mera Pehla Dost Aur Aakhri Sahara 🛡️',
    description: 'Duniya mein chahe koi sath de na de, mujhe yaqeen rehta hai ke mere Kareem Bhai mere sath hain.',
    date: 'Aitmad Aur Yaqeen'
  },
  {
    caption: 'Umrah Aur Hajj Ki Sa\'adat Ki Dua 🕋',
    description: 'Rab se dua hai ke hum dono bhaiyon ko ek sath Baitullah aur Roza-e-Rasool ﷺ ki ziyarat naseeb farmaye.',
    date: 'Muqaddas Tamanna'
  },
  {
    caption: 'Ghar Ka Roshan Sitara ⭐',
    description: 'Aapki roshni se hamari har subah aur har sham pur-noor aur barkat-khez rehti hai.',
    date: 'Roshan Mustaqbil'
  },
  {
    caption: 'Bhai Jaan Ki Wafadari Aur Muhabbat 🤝',
    description: 'Rishte nibhana aur dilon ko jod kar rakhna koi aap se seekhe, mere pyare bhai.',
    date: 'Rishton Ka Ehtiram'
  },
  {
    caption: 'Aapki Har Kamyabi Meri Kamyabi Hai 🎯',
    description: 'Jab aap kamyab hote hain to chhote bhai ka seena fakhr se chauda ho jata hai.',
    date: 'Fakhr-e-Khandan'
  },
  {
    caption: 'Duaon Ka Haseen Tohfa 🤲',
    description: 'Khuda kare ke zindagi ka har lamha aapke liye nayi khushiyan aur azeem barkatein le kar aaye.',
    date: 'Naimaton Ka Shukr'
  },
  {
    caption: 'Bhai Jaan Ka Pur-Khuloos Andaaz 💐',
    description: 'Sadgi, sharafat aur tahzeeb ka behtareen paikar hain mere Kareem Bhai.',
    date: 'Tahzeeb Aur Adab'
  },
  {
    caption: 'Chhote Bhai Ki Taraf Se Salamat Rahe Yeh Rishta ❤️',
    description: 'Hum dono bhaiyon ka yeh pyar hamesha aisi hi khushboo bikherata rahe.',
    date: 'Daimi Muhabbat'
  },
  {
    caption: 'Ek Naya Din, Nayi Duaen 🌅',
    description: 'Har naya sooraj aapke chehre par nayi umeed aur be-panah muskurahatein lekar tuloo ho.',
    date: 'Nayi Subah'
  },
  {
    caption: 'Bhai Jaan Ki Pur-Aitemad Shakhsiyat 💼',
    description: 'Aapka aitemad aur istiqamat hum sab ke liye ek behtareen misaal hai.',
    date: 'Azm Aur Himmat'
  },
  {
    caption: 'Dilon Ka Sukoon — Kareem Bhai 🕊️',
    description: 'Aapki meethi guftagu sun kar dil ko jo chain milta hai wo kahin aur nahi.',
    date: 'Meethi Guftagu'
  },
  {
    caption: 'Yaadgaar Lamhaat Ki Mehfil 📸',
    description: 'Har tasveer ek tasweer nahi balke hamari khoobsurat zindagani ka ek pyara sa safha hai.',
    date: 'Albam Ki Yaad'
  },
  {
    caption: 'Kareem Bhai — Hamara Asal Sarmaya 💎',
    description: 'Duniya ki daulat aani-jani hai, magar aap jaisa ba-waqar bhai naseeb walon ko milta hai.',
    date: 'Anmol Rishta'
  },
  {
    caption: 'Mushkilaat Mein Dhaal Ban Kar Khade Rehne Wale 🛡️',
    description: 'Aapne hamesha meri ghaltiyon ko sudhara aur aage badhne ka raasta dikhaya.',
    date: 'Muhafiz Aur Dost'
  },
  {
    caption: 'Bhai Jaan Ka Shaandaar Andaaz ✨',
    description: 'Aapki shakhsiyat mein jo roab aur waqar hai, uske sath sath be-panah narmi bhi posheeda hai.',
    date: 'Waqar Aur Shaan'
  },
  {
    caption: 'Rab Ki Khaas Inayat 🙌',
    description: 'Alhamdulillah, laakh shukr hai us zaat-e-pak ka jisne mujhe aap jaisa behtareen bhai ata farmaya.',
    date: 'Shukrana-e-Rab'
  },
  {
    caption: 'Kareem Bhai Ki Pur-Josh Muskaan 😁',
    description: 'Aapki yeh hansi hamesha aisi hi khili rahe, dukh aur pareshani aapke qareeb bhi na aaye.',
    date: 'Hamesha Muskurayein'
  },
  {
    caption: 'Hamari Taqdeer Ka Khoobsurat Hissa 📜',
    description: 'Rab ne meri kismat mein aapko bada bhai likh kar meri zindagi ko mukammal kar diya.',
    date: 'Naseeb Ki Baat'
  },
  {
    caption: 'Bhai Jaan Ki Nasihat Aur Pyar 💡',
    description: 'Aapki har baat mein koi na koi azeem sabak aur be-inteha chahat chhipi hoti hai.',
    date: 'Danishmandana Baatein'
  },
  {
    caption: 'Zindagi Ki Har Raah Par Sath 👣',
    description: 'Jahan jahan zaroorat padi, aapka saya hamesha mere sar par qaim raha.',
    date: 'Hamesha Ka Sath'
  },
  {
    caption: 'Bhai Jaan Ke Haq Mein Dil Ki Gehraiyon Se Dua 🤲',
    description: 'Allah kare aapki umr daraaz ho, sehat la-jawaab ho aur izzat aasmaan ko chhuye.',
    date: 'Dua-e-Kamil'
  },
  {
    caption: 'Aapki Hifazat Hamari Pehli Dua 🛡️',
    description: 'Khuda aapko zamane ke har fitne se door rakhe aur hamesha aman wa chain ata farmaye.',
    date: 'Hifazat-e-Ilahi'
  },
  {
    caption: 'Bhai-Bhai Ki Mazboot Dosti 👬',
    description: 'Rishte khoon ke to hote hi hain, magar hamara rishta dosti aur aitebar ka bhi hai.',
    date: 'Misaali Dosti'
  },
  {
    caption: 'Kareem Bhai Ki Khoobsurat Soch 🌺',
    description: 'Aapki rooh aur soch dono pakeeza hain, jo har kisi ko acchai ki taraf raghib karti hain.',
    date: 'Pakeeza Soch'
  },
  {
    caption: 'Ghar Ki Zinat Aur Raunaq 🏡',
    description: 'Aapke bina koi mehfil mukammal nahi lagti. Aap hamari har khushi ka markaz hain.',
    date: 'Raunaq-e-Mehfil'
  },
  {
    caption: 'Bhai Jaan Ka Meetha Aur Shafiq Lahja 🍯',
    description: 'Aapki meethi baatein sun kar saari thakan door ho jati hai.',
    date: 'Meethi Zuban'
  },
  {
    caption: 'Aapki Khushi Meri Sabse Badi Khushi Hai 😊',
    description: 'Aapke chehre par khushi dekh kar dil ko jo rahat milti hai, wo lafzon se pare hai.',
    date: 'Khushi Ka Ehsas'
  },
  {
    caption: 'Hamesha Sar Buland Rahein, Bhai Jaan 🏔️',
    description: 'Rab aapko wo azeem maqam ata kare jiski aap qabiliyat aur ahliaat rakhte hain.',
    date: 'Buland Maqam'
  },
  {
    caption: 'Bhai-Bhai Ka Pyar Hamesha Zinda Rahe ❤️',
    description: 'Waqt badal sakta hai, mausam badal sakte hain, magar hamara pyar hamesha taza dam rahega.',
    date: 'Lafani Mohabbat'
  },
  {
    caption: 'Kareem Bhai Ka Pyara Tasawwur 🌸',
    description: 'Aap jaisa ba-waqar aur nek-dil bhai har kisi ki khwahish hota hai.',
    date: 'Pyari Yaadein'
  },
  {
    caption: 'Har Dua Mein Aapka Zikr 🤲',
    description: 'Rab se jab bhi maanga hai, aapki salamati aur kamyabi ko zaroor shamil kiya hai.',
    date: 'Duaon Ka Silsila'
  },
  {
    caption: 'Bhai Jaan Ki Pur-Azeemat Zindagi 🌟',
    description: 'Aapki mehnat aur lagan se hum sab ko aage badhne ka sabaq milta hai.',
    date: 'Mehnat Ka Phal'
  },
  {
    caption: 'Chhota Bhai Hamesha Aapke Sath Hai 🤝',
    description: 'Aap jab bhi puchenge, aapka chhota bhai hamesha aapke shana-ba-shana khada milega.',
    date: 'Shana-ba-Shana'
  },
  {
    caption: 'Kareem Bhai Ki Roshan Soorat ✨',
    description: 'Aapke noorani chehre par hamesha rehmat ki chamak rehti hai.',
    date: 'Noorani Muskaan'
  },
  {
    caption: 'Mohabbat Aur Khuloos Ka Guldasta 💐',
    description: 'Aapne hamesha nafrat ke badle mohabbat aur gusse ke badle tahammul sikhaya hai.',
    date: 'Husn-e-Sulook'
  },
  {
    caption: 'Bhai Jaan Ke Sath Ek Dilchasp Guftagu ☕',
    description: 'Aapke sath baith kar guftagu karna dil ke liye ek roohani khushi ka sabab banta hai.',
    date: 'Dostana Baatein'
  },
  {
    caption: 'Allah Aapko Dono Jahan Ki Naimatein Ata Kare 🌈',
    description: 'Duniya ki khushiyan bhi aapki hon aur aakhirat ka aala tareen darja bhi aapka ho.',
    date: 'Barkat-e-Darain'
  },
  {
    caption: 'Kareem Bhai — Hamari Ummeed Ka Diya 🕯️',
    description: 'Andheron mein bhi aapki rehnumai hum sab ke liye ek roshan diya sabit hoti hai.',
    date: 'Roshan Diya'
  },
  {
    caption: 'Bhai Jaan Ka Pakeeza Andaaz 🤍',
    description: 'Aapki sadgi hi aapki sabse badi khoobsurti aur pehchan hai.',
    date: 'Sadgi Aur Sharafat'
  },
  {
    caption: 'Duaon Bhari Zindagi Ka Safar 🚶‍♂️',
    description: 'Har qadam par Allah ki rehmat aur farishton ki hifazat aapke hum-qadam rahe.',
    date: 'Safar-e-Zindagi'
  },
  {
    caption: 'Aapka Saath Sabse Keemti Hai 🏆',
    description: 'Mujhe duniya ki kisi daulat ki tamanna nahi jab tak mere Kareem Bhai mere sath hain.',
    date: 'Keemti Sarmaya'
  },
  {
    caption: 'Bhai Jaan Ki Mehfil, Khushiyon Ki Mehfil 🎊',
    description: 'Jahan aap hote hain wahan udasi ka guzar nahi hota. Hamesha haste muskurate rahein!',
    date: 'Khushiyon Ka Markaz'
  },
  {
    caption: 'Rab Ka Shukr, Bhai Ka Pyar 💖',
    description: 'Har saans ke sath Allah ka shukr ada karta hoon ke mujhe aap jaisa behtareen bhai mila.',
    date: 'Shukr-e-Naimat'
  },
  {
    caption: 'Kareem Bhai Ka Pyara Andaaz-e-Guftagu 🎙️',
    description: 'Aapki baaton mein aisi mithas aur aqalmandi hoti hai jo seedha dil mein utar jati hai.',
    date: 'Sheereen Guftagu'
  },
  {
    caption: 'Bhai Jaan Ka Hamesha Ka Sahara 🤝',
    description: 'Jab bhi chhote bhai ko zaroorat padi, aap sabse pehle aage badh kar khade hue.',
    date: 'Mazboot Sahara'
  },
  {
    caption: 'Har Khwahish Puri Ho, Bhai Jaan 🌠',
    description: 'Aapne jitni qurbaniyan aur mehnat ki hai, Allah uska azeem ajar aapki jholi mein dale.',
    date: 'Maqbool Dua'
  },
  {
    caption: 'Bhai-Bhai Ka Misaali Rishta 🌟',
    description: 'Log dosti ki misaal dete hain, hum dono bhai bhai-chare ki misaal hain.',
    date: 'Misaali Rishta'
  },
  {
    caption: 'Kareem Bhai Ki Azmat Ko Salam 🫡',
    description: 'Aapki shakhsiyat aur aapke kaam hum sab ke liye hamesha fakhr ka baais rahe hain.',
    date: 'Azmat Aur Izzat'
  },
  {
    caption: 'Aapka Chhota Bhai Hamesha Dua-go Hai 🤲',
    description: 'Meri har dua aapke naam se shuru hoti hai aur aapki lambi umr par khatam hoti hai.',
    date: 'Chhote Bhai Ki Dua'
  },
  {
    caption: 'Bhai Jaan Ki Muskurahat Ka Noor ✨',
    description: 'Aap hamesha aise hi khile rahein aur aapke chehre ka noor hamesha chamakta rahe.',
    date: 'Noorani Chehra'
  },
  {
    caption: 'Janay Kaash Yeh Lamhe Thehar Jayen ⏳',
    description: 'Aapke sath beeta hua har lamha itna pyara hai ke dil chahta hai waqt yahin ruk jaye.',
    date: 'Keemti Lamhe'
  },
  {
    caption: 'JANAMDIN MUBARAK, BHAI JAAN ❤️',
    description: 'Aapke janamdin par aapka chhota bhai poore dil se aapko mubarakbad aur dhero duaen pesh karta hai!',
    date: 'Janamdin Mubarak'
  },
  {
    caption: 'Bhai Jaan — Hamara Fakhr, Hamari Zindagi 👑',
    description: 'Allah Ta\'ala hum dono bhaiyon ki is mohabbat ko ta-umr salamat aur ba-barkat rakhe. Ameen Ya Rabbal Aalameen!',
    date: 'Dua-e-Khatam'
  }
];

async function updateAllPhotoCaptions() {
  try {
    console.log('[Captions] Connecting to MongoDB Atlas...');
    await connectDB();

    const photos = await Photo.find().sort({ sortOrder: 1, createdAt: 1 });
    console.log(`[Captions] Found ${photos.length} photos in database.`);

    if (photos.length === 0) {
      console.log('[Captions] No photos found to update.');
      await disconnectDB();
      process.exit(0);
    }

    let updatedCount = 0;

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      // Pick curated caption or cyclic fallback
      const data = captionsLibrary[i % captionsLibrary.length];

      photo.caption = data.caption;
      photo.description = data.description;
      photo.photoDate = data.date;
      photo.isPublished = true; // Ensure all 77 photos are published
      // Set the first photo as the featured Cover Photo for the website hero
      if (i === 0) {
        photo.isCover = true;
      } else {
        photo.isCover = false;
      }
      photo.sortOrder = i + 1;

      await photo.save();
      updatedCount++;

      console.log(`[${i + 1}/${photos.length}] Updated: "${photo.caption}" (${photo.photoDate})`);
    }

    console.log('========================================================');
    console.log(`✅ SUCCESS: All ${updatedCount} photos updated with heartfelt captions!`);
    console.log(`⭐ First photo set as active Cover Photo for public site hero.`);
    console.log(`🌐 All ${updatedCount} photos verified as Published for public gallery.`);
    console.log('========================================================');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Captions] Error updating captions:', err);
    await disconnectDB();
    process.exit(1);
  }
}

updateAllPhotoCaptions();
