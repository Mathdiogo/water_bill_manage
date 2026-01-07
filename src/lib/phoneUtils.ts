/**
 * Utilitários para formatação e validação de telefones brasileiros
 * Padrão: +55 (DDD) XXXXX-XXXX
 */

/**
 * Formata um número de telefone brasileiro para o padrão +55 (DDD) XXXXX-XXXX
 * @param phone - Número de telefone (com ou sem formatação)
 * @returns Telefone formatado ou string vazia se inválido
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove tudo que não é número
  const numbers = phone.replace(/\D/g, '');
  
  // Remove o código do país se vier junto (55)
  const cleanNumbers = numbers.startsWith('55') && numbers.length > 11 
    ? numbers.substring(2) 
    : numbers;
  
  // Valida se tem DDD + número (10 ou 11 dígitos)
  if (cleanNumbers.length < 10 || cleanNumbers.length > 11) {
    return phone; // Retorna original se não for válido
  }
  
  const ddd = cleanNumbers.substring(0, 2);
  
  // Celular (11 dígitos) ou Fixo (10 dígitos)
  if (cleanNumbers.length === 11) {
    const part1 = cleanNumbers.substring(2, 7);
    const part2 = cleanNumbers.substring(7, 11);
    return `+55 (${ddd}) ${part1}-${part2}`;
  } else {
    const part1 = cleanNumbers.substring(2, 6);
    const part2 = cleanNumbers.substring(6, 10);
    return `+55 (${ddd}) ${part1}-${part2}`;
  }
}

/**
 * Aplica máscara de telefone em tempo real durante digitação
 * @param value - Valor atual do input
 * @returns Valor formatado
 */
export function maskPhoneInput(value: string): string {
  if (!value) return '';
  
  // Remove tudo que não é número
  let numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos (DDD + 9 dígitos)
  numbers = numbers.substring(0, 11);
  
  // Aplica formatação progressiva
  if (numbers.length === 0) return '';
  if (numbers.length <= 2) return `+55 (${numbers}`;
  if (numbers.length <= 6) return `+55 (${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
  if (numbers.length <= 10) {
    return `+55 (${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
  }
  // Celular com 11 dígitos
  return `+55 (${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`;
}

/**
 * Remove toda formatação do telefone, mantendo apenas números
 * @param phone - Telefone formatado
 * @returns Apenas números
 */
export function removePhoneFormatting(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Valida se um telefone brasileiro é válido
 * @param phone - Telefone para validar
 * @returns true se válido
 */
export function isValidPhone(phone: string): boolean {
  const numbers = removePhoneFormatting(phone);
  
  // Remove código do país se presente
  const cleanNumbers = numbers.startsWith('55') && numbers.length > 11 
    ? numbers.substring(2) 
    : numbers;
  
  // Deve ter 10 (fixo) ou 11 (celular) dígitos
  if (cleanNumbers.length < 10 || cleanNumbers.length > 11) return false;
  
  // DDD deve estar entre 11 e 99
  const ddd = parseInt(cleanNumbers.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  
  // Se for celular (11 dígitos), deve começar com 9
  if (cleanNumbers.length === 11 && cleanNumbers[2] !== '9') return false;
  
  return true;
}

/**
 * Converte telefone para formato WhatsApp (apenas números com código do país)
 * @param phone - Telefone formatado
 * @returns Número no formato 5511999999999
 */
export function phoneToWhatsApp(phone: string): string {
  const numbers = removePhoneFormatting(phone);
  
  // Se já tem 55, retorna direto
  if (numbers.startsWith('55') && numbers.length >= 12) {
    return numbers;
  }
  
  // Adiciona 55 se não tiver
  return `55${numbers}`;
}
