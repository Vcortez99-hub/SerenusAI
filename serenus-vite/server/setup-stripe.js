const { setupStripeProducts } = require('./stripe-config');

/**
 * Script para configurar produtos e preços no Stripe
 * Execute este script uma vez para criar os produtos no Stripe Dashboard
 */
async function main() {
  try {
    console.log('🚀 Iniciando configuração do Stripe...');
    
    const result = await setupStripeProducts();
    
    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('\n📋 Copie os IDs abaixo e atualize seu arquivo .env:');
    console.log(`STRIPE_BASIC_PRICE_ID=${result.basic.price.id}`);
    console.log(`STRIPE_PREMIUM_PRICE_ID=${result.premium.price.id}`);
    
    console.log('\n✅ Produtos criados:');
    console.log(`- ${result.basic.product.name}: ${result.basic.price.id}`);
    console.log(`- ${result.premium.product.name}: ${result.premium.price.id}`);
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
    process.exit(1);
  }
}

// Executar o script
main();