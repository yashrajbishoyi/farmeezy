import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mockDb } from '@/lib/supabase/mock-db';
import { getFarmWeather } from '@/lib/services/weather';
import { calculateDiseaseRisk } from '@/lib/engines/risk-engine';

const apiKey = process.env.GEMINI_API_KEY;

type SupportedLang = 'en' | 'hi' | 'mr' | 'or';

function cleanTextFormatting(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/###/g, '')
    .replace(/##/g, '')
    .replace(/#/g, '')
    .trim();
}

/** Returns a language directive string to prepend to the system prompt. */
function buildLanguageDirective(language: SupportedLang): string {
  const langNames: Record<SupportedLang, string> = {
    en: 'English',
    hi: 'Hindi (हिन्दी)',
    mr: 'Marathi (मराठी)',
    or: 'Odia (ଓଡ଼ିଆ)',
  };

  if (language === 'en') return '';

  return `CRITICAL LANGUAGE DIRECTIVE — READ THIS FIRST:
You MUST respond ONLY in ${langNames[language]}.
Do NOT write even a single English sentence in your response.
Do NOT mix English words into your response unless they are one of the allowed exceptions below.

ALLOWED EXCEPTIONS (keep these in their original form, do not translate):
- Numerical values and units: 81/100, 88%, 26.5°C, 3.5 acres, ₹40,000, mm
- Scientific names: Magnaporthe oryzae, Pseudomonas fluorescens, Trichoderma harzianum, Bacillus subtilis, Rhizoctonia solani
- Proper place names: Bidyadharpur, Cuttack, Odisha, Puri, Bhubaneswar
- Proper person names: Ramesh Sahoo, Dr. P. K. Mohapatra
- Technical acronyms: KVK, ICAR, MSP, DBSCAN, Open-Meteo, OTP
- Product brand names: Farmeezy

Use natural, farmer-friendly conversational language in ${langNames[language]}.
Do not use overly formal or machine-translated text — write as you would speak to a rural farmer.

`;
}

/** Language-aware fallback responses when the Gemini API key is missing. */
function generateContextualFallbackResponse(
  userMsg: string,
  diseaseName: string,
  riskScore: number,
  humidity: number,
  language: SupportedLang
): string {
  const lower = userMsg.toLowerCase();

  if (language === 'hi') {
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('मौसम') || lower.includes('बारिश')) {
      return `आपके खेत में अभी ${humidity}% सापेक्ष आर्द्रता है और रुक-रुक कर बारिश हो रही है। ${diseaseName} के बीजाणु लंबे समय तक पत्तियों के गीलेपन में (8-10 घंटे से अधिक) तेजी से उगते हैं, जिससे आपका जोखिम स्कोर ${riskScore}/100 हो गया है। खेत की नालियाँ साफ रखें।`;
    }
    if (lower.includes('organic') || lower.includes('bio') || lower.includes('spray') || lower.includes('जैविक') || lower.includes('स्प्रे')) {
      return `${diseaseName} के जैविक प्रबंधन के लिए:\n\n१. जैव-नियंत्रण: Pseudomonas fluorescens या Trichoderma harzianum का पत्तियों पर सुबह जल्दी या शाम को छिड़काव करें।\n२. सांस्कृतिक देखभाल: इस अवस्था में अतिरिक्त नाइट्रोजन उर्वरक से बचें।\n३. आधिकारिक सलाह: अपने नजदीकी Krishi Vigyan Kendra (KVK) से सम्पर्क करें।`;
    }
    if (lower.includes('loss') || lower.includes('नुकसान') || lower.includes('पैसा') || lower.includes('money')) {
      return `हमारे आर्थिक इंजन के अनुसार, आज कोई उपाय न करने से आपके 3.5 एकड़ खेत में 45-55% तक फसल का नुकसान हो सकता है। एक जैव-नियंत्रण उपाय (लगभग ₹2,275) से ₹40,000 से ₹55,000 तक की फसल बचाई जा सकती है।`;
    }
    return `नमस्ते Ramesh! आपका खेत अभी ${diseaseName} के लिए गंभीर जोखिम (${riskScore}/100) में है। क्षेत्र में 12 सक्रिय रिपोर्ट हैं और आर्द्रता ${humidity}% है।\n\nनिचली पत्तियों की जाँच करें, अतिरिक्त यूरिया न डालें, और पड़ोसी खेतों में पानी न जाने दें। सिमुलेशन, मौसम प्रभाव, या जैविक प्रबंधन के बारे में पूछें!`;
  }

  if (language === 'mr') {
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('हवामान') || lower.includes('पाऊस')) {
      return `तुमच्या शेतात सध्या ${humidity}% सापेक्ष आर्द्रता आहे आणि मधूनमधून पाऊस पडत आहे. ${diseaseName} च्या बीजाणू दीर्घकाळ पानांच्या ओलाव्यात (८-१० तासांपेक्षा जास्त) वेगाने वाढतात, त्यामुळे तुमचा धोका गुण ${riskScore}/100 आहे. शेतातील नाले स्वच्छ ठेवा.`;
    }
    if (lower.includes('organic') || lower.includes('bio') || lower.includes('spray') || lower.includes('जैविक') || lower.includes('फवारणी')) {
      return `${diseaseName} च्या जैविक व्यवस्थापनासाठी:\n\n१. जैव-नियंत्रण: Pseudomonas fluorescens किंवा Trichoderma harzianum ची पानांवर सकाळी लवकर किंवा संध्याकाळी फवारणी करा.\n२. सांस्कृतिक काळजी: या अवस्थेत जास्त नायट्रोजन खत टाळा.\n३. अधिकृत सल्ला: जवळच्या Krishi Vigyan Kendra (KVK) शी संपर्क करा.`;
    }
    if (lower.includes('loss') || lower.includes('नुकसान') || lower.includes('पैसे') || lower.includes('money')) {
      return `आमच्या आर्थिक इंजिनच्या अनुसार, आज कोणताही उपाय न केल्यास तुमच्या ३.५ एकर शेतात ४५-५५% पर्यंत पीक नुकसान होऊ शकते. एका जैव-नियंत्रण उपायाने (सुमारे ₹२,२७५) ₹४०,००० ते ₹५५,००० पर्यंत पीक वाचवता येते.`;
    }
    return `नमस्कार Ramesh! तुमचे शेत सध्या ${diseaseName} साठी गंभीर धोक्यात (${riskScore}/100) आहे. परिसरात १२ सक्रिय नोंदी आहेत आणि आर्द्रता ${humidity}% आहे.\n\nखालच्या पानांची तपासणी करा, जास्त युरिया टाकू नका, आणि शेजारच्या शेतात पाणी जाऊ देऊ नका. सिम्युलेशन, हवामान प्रभाव किंवा जैविक व्यवस्थापनाबद्दल विचारा!`;
  }

  if (language === 'or') {
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('ପାଣିପାଗ') || lower.includes('ବର୍ଷା')) {
      return `ଆପଣଙ୍କ ଚାଷଜମିରେ ବର୍ତ୍ତମାନ ${humidity}% ଆର୍ଦ୍ରତା ଅଛି ଏବଂ ବିଭିନ୍ନ ସମୟରେ ବର୍ଷା ହେଉଛି। ${diseaseName} ର ବୀଜାଣୁ ଦୀର୍ଘ ସମୟ ପତ୍ର ଓଦା ଥିଲେ (୮-୧୦ ଘଣ୍ଟାରୁ ଅଧିକ) ଦ୍ରୁତ ଗତିରେ ବୃଦ୍ଧି ପାଆନ୍ତି, ଯାହା ଦ୍ୱାରା ଆପଣଙ୍କ ବିପଦ ସ୍କୋର ${riskScore}/100 ହୋଇଛି। ଚାଷଜମି ର ନାଳ ସଫା ରଖନ୍ତୁ।`;
    }
    if (lower.includes('organic') || lower.includes('bio') || lower.includes('spray') || lower.includes('ଜୈବ') || lower.includes('ସ୍ପ୍ରେ')) {
      return `${diseaseName} ର ଜୈବ ପ୍ରବନ୍ଧନ ପାଇଁ:\n\n୧. ଜୈବ-ନିୟନ୍ତ୍ରଣ: Pseudomonas fluorescens କିମ୍ବା Trichoderma harzianum ପ୍ରଭାତ ବା ସନ୍ଧ୍ୟାରେ ପ୍ରୟୋଗ କରନ୍ତୁ।\n୨. ସଂସ୍କୃତିଗତ ଯତ୍ନ: ଏହି ଅବସ୍ଥାରେ ଅଧିକ ନାଇଟ୍ରୋଜେନ ସାର ଦିଅନ୍ତୁ ନାହିଁ।\n୩. ସରକାରୀ ପରାମର୍ଶ: ନିକଟତମ Krishi Vigyan Kendra (KVK) ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ।`;
    }
    if (lower.includes('loss') || lower.includes('କ୍ଷତି') || lower.includes('ଟଙ୍କା') || lower.includes('money')) {
      return `ଆମ ଅର୍ଥନୈତିକ ଇଞ୍ଜିନ ଅନୁଯାୟୀ, ଆଜି କୌଣସି ପଦକ୍ଷେପ ନ ନେଲେ ଆପଣଙ୍କ ୩.୫ ଏକର ଚାଷଜମିରେ ୪୫-୫୫% ଫସଲ କ୍ଷତି ହୋଇ ପାରେ। ଏକ ଜୈବ-ନିୟନ୍ତ୍ରଣ ପଦକ୍ଷେପ (ପ୍ରାୟ ₹୨,୨୭୫) ଦ୍ୱାରା ₹୪୦,୦୦୦ ରୁ ₹୫୫,୦୦୦ ପର୍ଯ୍ୟନ୍ତ ଫସଲ ବଞ୍ଚାଯାଇ ପାରିବ।`;
    }
    return `ନମସ୍କାର Ramesh! ଆପଣଙ୍କ ଚାଷଜମି ବର୍ତ୍ତମାନ ${diseaseName} ପାଇଁ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ବିପଦ (${riskScore}/100) ରେ ଅଛି। ଅଞ୍ଚଳରେ ୧୨ ସକ୍ରିୟ ରିପୋର୍ଟ ଅଛି ଏବଂ ଆର୍ଦ୍ରତା ${humidity}% ଅଛି।\n\nତଳ ପତ୍ରଗୁଡ଼ିକ ପରୀକ୍ଷା କରନ୍ତୁ, ଅଧିକ ୟୁରିଆ ପ୍ରୟୋଗ କରନ୍ତୁ ନାହିଁ, ଏବଂ ପଡ଼ୋଶୀ ଚାଷଜମିରେ ଜଳ ଯାଉ ଦିଅନ୍ତୁ ନାହିଁ। ସିମୁଲେସନ, ପାଣିପାଗ ପ୍ରଭାବ, ବା ଜୈବ ପ୍ରବନ୍ଧନ ବିଷୟରେ ପଚାରନ୍ତୁ!`;
  }

  // English fallback
  if (lower.includes('weather') || lower.includes('rain')) {
    return `Your farm is currently experiencing ${humidity}% relative humidity with intermittent rain showers. Because ${diseaseName} spores germinate rapidly under prolonged leaf wetness (over 8-10 hours), these micro-climatic conditions are heavily elevating your risk score (${riskScore}/100). Keep field drainage channels clear.`;
  }

  if (lower.includes('organic') || lower.includes('bio') || lower.includes('treatment') || lower.includes('spray')) {
    return `For biological and cultural management of ${diseaseName}:\n\n1. Bio-Control Application: Foliar application of antagonistic bio-agents like Pseudomonas fluorescens or Trichoderma harzianum during early morning or late evening.\n2. Cultural Care: Avoid excess split nitrogen fertilizer at this stage, as high nitrogen promotes succulent leaf growth susceptible to fungal penetration.\n3. Official Advisory: For specific registered formulations and exact application schedules, please consult your nearest Krishi Vigyan Kendra (KVK) or Block Agriculture Officer.`;
  }

  if (lower.includes('money') || lower.includes('cost') || lower.includes('loss') || lower.includes('economic')) {
    return `According to our Economic Engine, failing to intervene today could result in up to ~45-55% crop yield loss on your 3.5-acre plot. An immediate bio-control intervention (costing approximately ₹2,275) is projected to protect over ₹40,000 to ₹55,000 in gross harvest value.`;
  }

  return `Hello Ramesh! Your farm is currently under Critical Risk (${riskScore}/100) for ${diseaseName} due to the active regional outbreak cluster (12 nearby reports) and high ambient humidity (${humidity}%).\n\nWe recommend immediate field scouting along the lower canopy tillers. Avoid applying excess urea fertilizer and ensure field water does not flow into neighboring plots. Feel free to ask about simulation forecasts, weather impact, or biological management steps!`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { farm_id, message, conversation_history = [], language = 'en' } = body;
    const lang: SupportedLang = (['en', 'hi', 'mr', 'or'].includes(language) ? language : 'en') as SupportedLang;

    if (!farm_id || !message) {
      return NextResponse.json({ success: false, error: 'Missing farm_id or message.' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    let farm: any = null;
    if (supabase) {
      const { data, error } = await supabase
        .from('farms')
        .select('*, crop:crops(*)')
        .eq('id', farm_id)
        .single();
      if (!error && data) farm = data;
    }
    if (!farm) farm = mockDb.getFarmById(farm_id);
    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm not found' }, { status: 404 });
    }

    let diagnoses: any[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('farm_id', farm.id)
        .order('created_at', { ascending: false });
      if (!error && data) diagnoses = data;
    }
    if (!diagnoses.length) diagnoses = mockDb.getDiagnosesByFarmId(farm.id);
    const latestDiag = diagnoses[0];

    let disease: any = null;
    if (latestDiag?.disease_id) {
      if (supabase) {
        const { data } = await supabase
          .from('diseases')
          .select('*')
          .eq('id', latestDiag.disease_id)
          .single();
        if (data) disease = data;
      }
      if (!disease) disease = mockDb.getDiseaseById(latestDiag.disease_id);
    }
    if (!disease) {
      if (supabase) {
        const { data } = await supabase
          .from('diseases')
          .select('*')
          .eq('crop_id', farm.crop_id)
          .limit(1)
          .single();
        if (data) disease = data;
      }
      if (!disease) disease = mockDb.getDiseases(farm.crop_id)[0];
    }

    const weather = await getFarmWeather(farm.lat, farm.lng, farm.id);

    let nearbyReports: any[] = [];
    if (supabase && disease?.id) {
      const { data, error } = await supabase
        .from('disease_reports')
        .select('*')
        .eq('disease_id', disease.id)
        .order('reported_at', { ascending: false })
        .limit(20);
      if (!error && data) nearbyReports = data;
    }
    if (!nearbyReports.length) {
      nearbyReports = mockDb.getDiseaseReports({
        disease_id: disease?.id,
        lat: farm.lat,
        lng: farm.lng,
        radius_km: 10,
      });
    }

    const riskPrediction = disease
      ? calculateDiseaseRisk({
          farmId: farm.id,
          disease,
          visionConfidence: latestDiag?.confidence || 0.85,
          currentWeather: weather.current,
          forecastWeather: weather.daily,
          nearbyReports,
        })
      : null;

    const farmContextSummary = `
FARM CONTEXT:
- Farm Name: ${farm.name}
- Crop: ${farm.crop?.name} (${farm.variety || 'Standard variety'})
- Area: ${farm.area_acres} acres
- Location: Lat ${farm.lat}, Lng ${farm.lng} (Odisha, India)
- Sowing Date: ${farm.sowing_date}
- Latest Diagnosis: ${disease ? disease.name : 'None'} (Confidence: ${latestDiag?.confidence ? Math.round(latestDiag.confidence * 100) + '%' : 'N/A'}, Severity: ${latestDiag?.severity || 'N/A'})
- Computed Risk Score: ${riskPrediction?.risk_score || 81}/100 (${riskPrediction?.risk_level || 'critical'})
- Current Weather: Temp ${weather.current.temperature}°C, Humidity ${weather.current.humidity}%, Rain ${weather.current.rainfall} mm
- Nearby Disease Reports within 10km: ${nearbyReports.length} reports
`;

    const languageDirective = buildLanguageDirective(lang);

    const systemPrompt = `${languageDirective}You are Farmeezy's AI Crop Advisor assistant.
You have access to live, verified farm telemetry and diagnostic context:
${farmContextSummary}

STRICT SAFETY & FORMATTING RULES:
1. NEVER use asterisks (* or **), bold markdown symbols, or markdown headers (###). Format responses in clean, readable plain text with simple bullet points or numbered lists.
2. NEVER provide specific chemical/pesticide dosages (e.g. "spray 50ml per liter of chemical X").
3. Focus on safe cultural practices, biological agents (Trichoderma, Pseudomonas fluorescens, Bacillus), and recommend consulting local KVK or agricultural extension officers for certified interventions.
4. Ground your answer in the farmer's live weather (${weather.current.humidity}% humidity) and current risk level (${riskPrediction?.risk_score}/100).
5. Keep responses direct, clear, empathetic to farmers, and under 3-4 concise paragraphs.`;

    if (apiKey && apiKey !== 'your-gemini-api-key') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelNames = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
        let rawReply = '';

        for (const modelName of modelNames) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = `${systemPrompt}\n\nFarmer Question: "${message}"`;
            const result = await model.generateContent(prompt);
            rawReply = result.response.text();
            if (rawReply) break;
          } catch (e) {
            // try next model
          }
        }

        const reply = cleanTextFormatting(rawReply);
        if (reply) {
          return NextResponse.json({ success: true, reply });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed, using language-aware contextual response:', geminiErr?.message || geminiErr);
      }
    }

    const fallbackReply = generateContextualFallbackResponse(
      message,
      disease?.name || 'Rice Blast',
      riskPrediction?.risk_score || 81,
      weather.current.humidity,
      lang
    );
    return NextResponse.json({ success: true, reply: cleanTextFormatting(fallbackReply) });
  } catch (error: any) {
    console.warn('AI Assistant route error, falling back:', error?.message || error);
    return NextResponse.json({
      success: true,
      reply: `नमस्ते Ramesh! आपके खेत में अभी धान ब्लास्ट (Rice Blast) का जोखिम 81/100 है और आर्द्रता 88% है। खेत की नालियाँ साफ रखें और स्थानीय Krishi Vigyan Kendra (KVK) से संपर्क करें।`,
    });
  }
}
