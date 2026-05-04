// ==================== VALIDAÇÃO E CAPTURA DE LEADS ====================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('leadForm');
    const submitBtn = document.getElementById('submitBtn');

    // Event listeners para validação em tempo real
    document.getElementById('name').addEventListener('blur', validateName);
    document.getElementById('email').addEventListener('blur', validateEmail);
    document.getElementById('phone').addEventListener('blur', validatePhone);
    document.getElementById('phone').addEventListener('input', maskPhone);
    document.getElementById('consent').addEventListener('change', validateConsent);

    // Submit do formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validar todos os campos
        if (!validateForm()) {
            console.log('Formulário inválido');
            return;
        }

        // Desabilitar botão durante envio
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        // Coletar dados
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            company: formData.get('company'),
            message: formData.get('message'),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language
        };

        try {
            // ========== OPÇÃO 1: Formspree (Recomendado) ==========
            const response = await fetch('https://formspree.io/f/CHAVE_DO_FORMSPREE', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showSuccessMessage();
                form.reset();
                trackEvent('lead_submitted', 'success');
                console.log('Lead enviado com sucesso!');
            } else {
                throw new Error('Erro ao enviar lead');
            }

            // ========== OPÇÃO 2: Backend Próprio (Descomente se necessário) ==========
            /*
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showSuccessMessage();
                form.reset();
                trackEvent('lead_submitted', 'success');
            } else {
                throw new Error('Erro ao enviar lead');
            }
            */

        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar lead. Tente novamente.');
            trackEvent('lead_error', error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Meu Lead';
        }
    });
});

// ==================== VALIDAÇÕES ====================

function validateName() {
    const name = document.getElementById('name');
    const error = document.getElementById('nameError');
    
    if (name.value.trim().length < 3) {
        name.classList.add('error');
        error.classList.add('show');
        return false;
    } else {
        name.classList.remove('error');
        error.classList.remove('show');
        return true;
    }
}

function validateEmail() {
    const email = document.getElementById('email');
    const error = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email.value)) {
        email.classList.add('error');
        error.classList.add('show');
        return false;
    } else {
        email.classList.remove('error');
        error.classList.remove('show');
        return true;
    }
}

function validatePhone() {
    const phone = document.getElementById('phone');
    const error = document.getElementById('phoneError');
    // Remove caracteres não numéricos para validação
    const phoneDigits = phone.value.replace(/\D/g, '');
    
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        phone.classList.add('error');
        error.classList.add('show');
        return false;
    } else {
        phone.classList.remove('error');
        error.classList.remove('show');
        return true;
    }
}

function validateConsent() {
    const consent = document.getElementById('consent');
    const error = document.getElementById('consentError');
    
    if (!consent.checked) {
        error.classList.add('show');
        return false;
    } else {
        error.classList.remove('show');
        return true;
    }
}

function validateForm() {
    // Validar todos os campos obrigatórios
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isConsentValid = validateConsent();
    
    return isNameValid && isEmailValid && isPhoneValid && isConsentValid;
}

// ==================== MÁSCARA DE TELEFONE ====================

function maskPhone(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    if (value.length > 7) {
        value = value.substring(0, 5) + '-' + value.substring(5);
    }
    
    if (value.length > 5) {
        value = '(' + value.substring(0, 2) + ') ' + value.substring(2);
    }
    
    e.target.value = value;
}

// ==================== MENSAGEM DE SUCESSO ====================

function showSuccessMessage() {
    const form = document.getElementById('leadForm');
    const successMessage = document.getElementById('successMessage');
    
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Remover mensagem de sucesso após 5 segundos
    setTimeout(() => {
        form.style.display = 'block';
        successMessage.style.display = 'none';
    }, 5000);
}

// ==================== RASTREAMENTO DE EVENTOS ====================

function trackEvent(eventName, eventValue) {
    // Google Analytics (descomente se configurado)
    /*
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            'value': eventValue
        });
    }
    */
    
    // Log para debug
    console.log(`Event: ${eventName}, Value: ${eventValue}`);
}

// ==================== PROTEÇÃO CONTRA BOTS ====================

// Honeypot field (campo oculto para bots)
function addHoneypot() {
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.style.display = 'none';
    document.getElementById('leadForm').appendChild(honeypot);
}

// Verificar honeypot no submit
function checkHoneypot() {
    const honeypot = document.querySelector('input[name="website"]');
    if (honeypot && honeypot.value !== '') {
        console.warn('Bot detectado!');
        return false;
    }
    return true;
}

// ==================== ANALYTICS E TRACKING ====================

// Registrar tempo na página
window.addEventListener('load', function() {
    const pageLoadTime = performance.now();
    console.log(`Página carregou em ${pageLoadTime.toFixed(2)}ms`);
    trackEvent('page_load_time', pageLoadTime.toFixed(2));
});

// Rastrear quando o usuário sai sem converter
window.addEventListener('beforeunload', function(e) {
    const form = document.getElementById('leadForm');
    if (form.style.display !== 'none') {
        trackEvent('user_left_without_converting', 'true');
    }
});

// Scroll tracking (quando usuário vê o formulário)
const formSection = document.getElementById('form');
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            trackEvent('form_viewed', 'true');
            observer.unobserve(entry.target);
        }
    });
});

if (formSection) {
    observer.observe(formSection);
}

// ==================== UTILIDADES ====================

// Scroll suave para âncoras
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Detectar se a página está sendo visualizada (tab ativa/inativa)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        trackEvent('page_hidden', 'true');
    } else {
        trackEvent('page_visible', 'true');
    }
});

// ==================== VERIFICAÇÕES INICIAIS ====================

// Verificar suporte a tecnologias necessárias
if (!('fetch' in window)) {
    alert('Seu navegador é muito antigo. Por favor, atualize para uma versão recente.');
}

// Log de ambiente (debug)
console.log('Leads Form Script Carregado');
console.log('User Agent:', navigator.userAgent);
console.log('Language:', navigator.language);
console.log('Cookie Enabled:', navigator.cookieEnabled);