// Aguarda o DOM ser carregado completamente
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const acceptTerms = document.getElementById('accept-terms');
    const submitButton = document.querySelector('button[type="submit"]');

    // Sem validações no frontend – backend fará as checagens

    function showMessage(message, type) {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) existingMessage.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        messageDiv.style.padding = '10px';
        messageDiv.style.marginBottom = '15px';
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.fontWeight = '600';

        if (type === 'error') {
            messageDiv.style.backgroundColor = '#fff0f0';
            messageDiv.style.color = '#c33';
            messageDiv.style.border = '1px solid #f5c2c2';
        } else if (type === 'success') {
            messageDiv.style.backgroundColor = '#f0fff4';
            messageDiv.style.color = '#0a7a28';
            messageDiv.style.border = '1px solid #cceacc';
        }

        const formContainer = document.querySelector('.form-container');
        formContainer.insertBefore(messageDiv, form);

        setTimeout(() => {
            if (messageDiv.parentNode) messageDiv.remove();
        }, 5000);
    }

    function clearMessages() {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) existingMessage.remove();
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        clearMessages();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const accepted = acceptTerms.checked;

        // Envia direto ao backend; backend fará validações e retornará mensagens

        submitButton.disabled = true;
        submitButton.textContent = 'Cadastrando...';

        try {
            const payload = { name, email: email.toLowerCase(), password };
            console.log('[signup] payload:', payload);
            const result = await api.post('/signup', payload, { auth: false });
            console.log('[signup] resposta:', result);
            const data = result.data;

            if (result.ok) {
                showMessage(data?.message || 'Cadastro realizado com sucesso!', 'success');
                if (data?.token) {
                    sessionStorage.setItem('authToken', data.token);
                    console.info('[signup] token salvo em sessionStorage');
                }
                const redirectTo = window.__AFTER_LOGIN_REDIRECT__ || '/pages/singin/index.html';
                setTimeout(() => { window.location.href = redirectTo; }, 1200);
            } else {
                showMessage(data?.message || 'Erro ao cadastrar. Tente novamente.', 'error');
            }
        } catch (err) {
            console.error('Erro no request:', err);
            showMessage('Erro de conexão. Verifique o servidor.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Sign Up';
        }
    });

    [nameInput, emailInput, passwordInput].forEach(el => el.addEventListener('input', clearMessages));
});
