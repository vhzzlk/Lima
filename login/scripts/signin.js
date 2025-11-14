// Aguarda o DOM ser carregado completamente
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    const submitButton = document.querySelector('button[type="submit"]');

    // Função para fazer login
    async function handleLogin(event) {
        event.preventDefault(); // Previne o comportamento padrão do formulário

        // Obtém os valores dos campos
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const remember = rememberCheckbox.checked;

        // Envia os dados diretamente ao backend; backend fará validações

        // Desabilita o botão durante o envio
        submitButton.disabled = true;
        submitButton.textContent = 'Entrando...';

        try {
            // Dados para enviar ao backend
            const loginData = {
                email: email.toLowerCase(),
                password: password,
                remember: remember
            };

            // Debug: mostrar payload enviado
            console.log('[signin] payload:', loginData);

            // Faz a requisição para o backend via helper api
            const result = await api.post('/login', loginData, { auth: false });
            // Debug: mostrar resposta completa
            console.log('[signin] resposta:', result);

            const data = result.data;

            if (result.ok) {
                // Mostra a mensagem que o servidor retornar (se houver)
                showMessage(data?.message || 'Login realizado com sucesso!', 'success');

                // Armazena o token se fornecido
                if (data?.token) {
                    if (remember) {
                        localStorage.setItem('authToken', data.token);
                        console.info('[signin] token salvo em localStorage');
                    } else {
                        sessionStorage.setItem('authToken', data.token);
                        console.info('[signin] token salvo em sessionStorage');
                    }
                }

                // Redireciona: se a aplicação definir uma URL global usa ela, senão vai para '/'
                const redirectTo = window.__AFTER_LOGIN_REDIRECT__ || '/pages/dashboard/index.html';
                setTimeout(() => {
                    window.location.href = redirectTo;
                }, 1200);

            } else {
                // Erro de autenticação — mostrar também status para debug
                const serverMsg = data?.message || (typeof data === 'string' ? data : null);
                showMessage(serverMsg || `Credenciais inválidas. Tente novamente. (status ${result.status})`, 'error');
                console.warn('[signin] login falhou:', result);
            }

        } catch (error) {
            console.error('Erro na requisição:', error);
            showMessage('Erro de conexão. Verifique se o servidor está rodando.', 'error');
        } finally {
            // Reabilita o botão
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    }


    // Função para exibir mensagens
    function showMessage(message, type) {
        // Remove mensagem anterior se existir
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Cria nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Adiciona estilos inline caso não tenham sido definidos no CSS
        messageDiv.style.padding = '10px';
        messageDiv.style.marginBottom = '15px';
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.fontWeight = 'bold';
        
        if (type === 'error') {
            messageDiv.style.backgroundColor = '#fee';
            messageDiv.style.color = '#c33';
            messageDiv.style.border = '1px solid #fcc';
        } else if (type === 'success') {
            messageDiv.style.backgroundColor = '#efe';
            messageDiv.style.color = '#3c3';
            messageDiv.style.border = '1px solid #cfc';
        }

        // Insere a mensagem antes do formulário
        const formContainer = document.querySelector('.form-container');
        formContainer.insertBefore(messageDiv, form);

        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Adiciona o evento de submit ao formulário
    form.addEventListener('submit', handleLogin);

    // Adiciona eventos para limpar mensagens quando o usuário começar a digitar
    emailInput.addEventListener('input', clearMessages);
    passwordInput.addEventListener('input', clearMessages);

    function clearMessages() {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    // Função para verificar se já existe um token válido
    function checkExistingAuth() {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
            // Verifica se o token ainda é válido
            verifyToken(token);
        }
    }

    // Função para verificar se o token é válido
    async function verifyToken(token) {
        try {
            const verify = await api.get('/verify');
            if (verify.ok) window.location.href = '/dashboard';
            else { localStorage.removeItem('authToken'); sessionStorage.removeItem('authToken'); }
        } catch (error) {
            console.error('Erro ao verificar token:', error);
        }
    }

    // Não verifica autenticação automaticamente ao carregar — deixa o usuário fazer login normalmente
    // Descomente a linha abaixo se quiser verificar token automaticamente (depois implemente redirecionamento correto)
    // checkExistingAuth();
});