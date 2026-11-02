/* Configuração da sincronização com o Supabase.
   Está usando o MESMO projeto do Hinário: assim o login é o mesmo nos dois apps.
   Os valores vêm de: Supabase > seu projeto > Project Settings > API (ou o botão "Connect").
   A chave "anon / publishable" pode ficar aqui: ela é pública, e as regras de segurança
   do banco garantem que cada pessoa só vê as próprias pregações. */
window.PULPITO_CONFIG = {
  supabaseUrl: "https://wvkbyxffupyxgbsptyrn.supabase.co",
  supabaseAnonKey: "sb_publishable_NKeOq3XY4QGjRDxEJBzvUQ_mLLyokxI"
};
