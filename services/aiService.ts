// Ini adalah implementasi sederhana untuk demo
// Dalam produksi, Anda mungkin ingin menggunakan OpenAI API atau AI service lainnya

export async function getAIResponse(message: string): Promise<string> {
  // Simulasi delay untuk demo
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Contoh respons sederhana
  const responses = [
    "Terima kasih atas pesannya. Bisa saya bantu lebih lanjut?",
    "Baik, saya mengerti. Ada hal lain yang ingin didiskusikan?",
    "Menarik sekali. Mari kita bahas lebih detail.",
    "Saya akan coba bantu sebaik mungkin.",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
} 