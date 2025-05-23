document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (localStorage.getItem('zentry_logged_in') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    // ========== ESTADO DA APLICAÇÃO ==========
    let saldo = 8742.56;
    let faturaCartao = 1245.90;
    let limiteDisponivel = 2500.00;
    let currentSection = 'inicio';
    let cartaoBloqueado = false;
    let limiteCartao = 5000.00;
    let userData = {
        nome: "Carlos Silva",
        email: "carlos.silva@email.com",
        telefone: "(11) 98765-4321",
        senha: "zentry123"
    };
    
    let notifications = [
        { id: 1, title: "Bem-vindo ao Zentry", message: "Seu login foi realizado com sucesso", read: false },
        { id: 2, title: "Atualização disponível", message: "Nova versão do app na loja", read: false },
        { id: 3, title: "Oferta especial", message: "Limite do cartão aumentado para R$ 5.000,00", read: false }
    ];

    let investments = [
        { id: 1, name: "Zentry Guard", rate: "100% CDI", minValue: 100, liquidity: "Imediata" },
        { id: 2, name: "Zentry+ CDB", rate: "110% CDI", minValue: 1000, liquidity: "2 anos" },
        { id: 3, name: "Zentry Tesouro", rate: "IPCA+5,23%", minValue: 50, liquidity: "Longo prazo" }
    ];

    // ========== ELEMENTOS DO DOM ==========
    // Botões principais
    const pixBtn = document.querySelector('.pix-btn');
    const transferBtn = document.querySelector('.transfer-btn');
    const payBtn = document.querySelector('.pay-btn');
    const depositBtn = document.querySelector('.deposit-btn');
    const investBtn = document.querySelector('.btn-invest');
    const supportBtn = document.querySelector('.btn-support');
    const notificationBtn = document.querySelector('.btn-notification');
    const filterBtn = document.querySelector('.btn-filter');
    const showMoreBtn = document.querySelector('.btn-show-more');
    const logoutBtn = document.querySelector('.btn-logout');
    const payInvoiceBtn = document.querySelector('.btn-pay-invoice');
    const payFullBtn = document.querySelector('.btn-pay-full');
    const simulateLoanBtn = document.querySelector('.btn-simulate-loan');
    const requestLoanBtn = document.querySelector('.btn-request-loan');

    // Atalhos
    const shortcutPix = document.querySelector('.shortcut-item[data-action="pix"]');
    const shortcutRecarga = document.querySelector('.shortcut-item[data-action="recarga"]');
    const shortcutEmprestimo = document.querySelector('.shortcut-item[data-action="emprestimo"]');
    const shortcutInvestir = document.querySelector('.shortcut-item[data-action="investir"]');
    const shortcutSeguros = document.querySelector('.shortcut-item[data-action="seguros"]');
    const shortcutMais = document.querySelector('.shortcut-item[data-action="mais"]');

    // Cartões
    const bloquearCartaoBtn = document.querySelector('.btn-card-action[data-action="bloquear"]');
    const ajustarLimiteBtn = document.querySelector('.btn-card-action[data-action="ajustar"]');
    const cartaoVirtualBtn = document.querySelector('.btn-card-action[data-action="virtual"]');

    // Minha Conta
    const alterarSenhaBtn = document.querySelector('.btn-account-action:nth-child(1)');
    const alterarEmailBtn = document.querySelector('.btn-account-action:nth-child(2)');
    const alterarTelefoneBtn = document.querySelector('.btn-account-action:nth-child(3)');

    // Modais
    const modals = {
        transfer: document.getElementById('transferModal'),
        deposit: document.getElementById('depositModal'),
        support: document.getElementById('supportModal'),
        invoice: document.getElementById('invoiceModal'),
        cardBlock: document.getElementById('cardBlockModal'),
        limitAdjust: document.getElementById('limitAdjustModal'),
        virtualCard: document.getElementById('virtualCardModal'),
        changePassword: document.getElementById('changePasswordModal'),
        changeEmail: document.getElementById('changeEmailModal'),
        changePhone: document.getElementById('changePhoneModal'),
        investModal: document.getElementById('investModal')
    };

    // Formulários
    const forms = {
        transfer: document.getElementById('transferForm'),
        deposit: document.getElementById('depositForm'),
        support: document.getElementById('supportForm'),
        invoice: document.getElementById('invoiceForm'),
        pix: document.getElementById('pixForm'),
        limitAdjust: document.getElementById('limitAdjustForm'),
        changePassword: document.getElementById('changePasswordForm'),
        changeEmail: document.getElementById('changeEmailForm'),
        changePhone: document.getElementById('changePhoneForm'),
        investForm: document.getElementById('investForm')
    };

    // Seções
    const sections = document.querySelectorAll('.content-section');
    const navItems = document.querySelectorAll('.main-nav li');
    const transactionsList = document.querySelector('.transactions-list');

    // ========== FUNÇÕES AUXILIARES ==========
    function formatMoney(value) {
        return value.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL',
            minimumFractionDigits: 2
        });
    }

    function updateUI() {
        // Atualizar saldo
        document.querySelector('.balance-amount').textContent = formatMoney(saldo);
        
        // Atualizar limite disponível
        document.querySelector('.balance-details').textContent = `Limite disponível: ${formatMoney(limiteDisponivel)}`;
        
        // Atualizar fatura do cartão
        document.querySelector('.card-limit').textContent = `Fatura atual: ${formatMoney(faturaCartao)}`;
        
        // Atualizar notificações
        const unreadCount = notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        
        // Atualizar status do cartão
        if (cartaoBloqueado) {
            document.querySelector('.card-detail').style.opacity = '0.6';
            bloquearCartaoBtn.innerHTML = '<i class="fas fa-unlock"></i> <span>Desbloquear Cartão</span>';
        } else {
            document.querySelector('.card-detail').style.opacity = '1';
            bloquearCartaoBtn.innerHTML = '<i class="fas fa-lock"></i> <span>Bloquear Cartão</span>';
        }
    }

    function showSection(sectionId) {
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        const activeSection = document.getElementById(`${sectionId}-section`);
        if (activeSection) {
            activeSection.style.display = 'block';
            currentSection = sectionId;
        }
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
        });
    }

    function showModal(modalId) {
        if (modals[modalId]) {
            modals[modalId].style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeAllModals() {
        Object.values(modals).forEach(modal => {
            if (modal) modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }

    function addTransaction(name, amount, type, description = '') {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        transactionItem.innerHTML = `
            <div class="transaction-icon">
                <i class="fas fa-${type === 'income' ? 'arrow-down' : 'arrow-up'}"></i>
            </div>
            <div class="transaction-details">
                <h3>${name}</h3>
                <span>Hoje, ${timeString}</span>
                ${description ? `<p class="transaction-description">${description}</p>` : ''}
            </div>
            <div class="transaction-amount ${type}">
                ${type === 'income' ? '+' : '-'} ${formatMoney(amount)}
            </div>
        `;
        
        transactionsList.insertBefore(transactionItem, transactionsList.firstChild);
    }

    function showNotifications() {
        const notificationPopup = document.createElement('div');
        notificationPopup.className = 'notification-popup';
        
        const unreadCount = notifications.filter(n => !n.read).length;
        notificationPopup.innerHTML = `
            <div class="notification-header">
                <h3>Notificações (${unreadCount})</h3>
                <button class="close-notifications">&times;</button>
            </div>
            <div class="notification-content">
                ${notifications.map(n => `
                    <div class="notification-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}">
                        <h4>${n.title}</h4>
                        <p>${n.message}</p>
                        <span class="notification-time">Agora há pouco</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.body.appendChild(notificationPopup);
        
        notificationPopup.querySelector('.close-notifications').addEventListener('click', () => {
            notificationPopup.remove();
        });
        
        notificationPopup.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                notifications = notifications.map(n => 
                    n.id === id ? {...n, read: true} : n
                );
                updateUI();
                this.classList.replace('unread', 'read');
            });
        });
    }

    function applyInputMasks() {
        // Máscara para CPF
        const cpfInputs = document.querySelectorAll('input[type="text"][id*="cpf"]');
        cpfInputs.forEach(input => {
            input.addEventListener('input', function() {
                let value = this.value.replace(/\D/g, '');
                if (value.length > 3) value = value.replace(/^(\d{3})(\d)/, '$1.$2');
                if (value.length > 6) value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
                if (value.length > 9) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
                if (value.length > 11) value = value.substring(0, 14);
                this.value = value;
            });
        });

        // Máscara para telefone
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', function() {
                let value = this.value.replace(/\D/g, '');
                if (value.length > 0) value = value.replace(/^(\d{2})(\d)/, '($1) $2');
                if (value.length > 10) value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                this.value = value.substring(0, 15);
            });
        });

        // Máscara para valores monetários
        const moneyInputs = document.querySelectorAll('input[type="text"][id*="Value"]');
        moneyInputs.forEach(input => {
            input.addEventListener('input', function() {
                let value = this.value.replace(/\D/g, '');
                value = (value / 100).toFixed(2);
                value = value.replace('.', ',');
                value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                this.value = 'R$ ' + value;
            });
        });
    }

    function createModal(id, title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = id;
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${title}</h2>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    function initModals() {
        // Modal de bloquear cartão
        createModal('cardBlockModal', 'Bloquear Cartão', `
            <p>Tem certeza que deseja ${cartaoBloqueado ? 'desbloquear' : 'bloquear'} seu cartão?</p>
            <div class="modal-actions">
                <button class="btn-cancel">Cancelar</button>
                <button class="btn-confirm-block">${cartaoBloqueado ? 'Desbloquear' : 'Bloquear'}</button>
            </div>
        `);

        // Modal de ajuste de limite
        createModal('limitAdjustModal', 'Ajustar Limite', `
            <form id="limitAdjustForm">
                <div class="form-group">
                    <label for="newLimit">Novo limite</label>
                    <input type="text" id="newLimit" placeholder="R$ 0,00" value="${formatMoney(limiteCartao)}">
                </div>
                <button type="submit" class="btn-confirm">Confirmar</button>
            </form>
        `);

        // Modal de cartão virtual
        createModal('virtualCardModal', 'Cartão Virtual', `
            <div class="virtual-card-info">
                <p>Número: <strong>•••• •••• •••• 7890</strong></p>
                <p>CVV: <strong>123</strong></p>
                <p>Validade: <strong>05/28</strong></p>
                <p>Limite: <strong>${formatMoney(limiteCartao)}</strong></p>
            </div>
            <button class="btn-close-modal">Fechar</button>
        `);

        // Modal de alterar senha
        createModal('changePasswordModal', 'Alterar Senha', `
            <form id="changePasswordForm">
                <div class="form-group">
                    <label for="currentPassword">Senha atual</label>
                    <input type="password" id="currentPassword" required>
                </div>
                <div class="form-group">
                    <label for="newPassword">Nova senha</label>
                    <input type="password" id="newPassword" required>
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirmar nova senha</label>
                    <input type="password" id="confirmPassword" required>
                </div>
                <button type="submit" class="btn-confirm">Alterar Senha</button>
            </form>
        `);

        // Modal de alterar email
        createModal('changeEmailModal', 'Alterar E-mail', `
            <form id="changeEmailForm">
                <div class="form-group">
                    <label for="newEmail">Novo e-mail</label>
                    <input type="email" id="newEmail" value="${userData.email}" required>
                </div>
                <div class="form-group">
                    <label for="confirmEmail">Confirmar novo e-mail</label>
                    <input type="email" id="confirmEmail" value="${userData.email}" required>
                </div>
                <button type="submit" class="btn-confirm">Alterar E-mail</button>
            </form>
        `);

        // Modal de alterar telefone
        createModal('changePhoneModal', 'Alterar Telefone', `
            <form id="changePhoneForm">
                <div class="form-group">
                    <label for="newPhone">Novo telefone</label>
                    <input type="tel" id="newPhone" value="${userData.telefone}" required>
                </div>
                <button type="submit" class="btn-confirm">Alterar Telefone</button>
            </form>
        `);

        // Modal de investimento
        createModal('investModal', 'Investir', `
            <form id="investForm">
                <div class="form-group">
                    <label for="investmentType">Tipo de investimento</label>
                    <select id="investmentType" required>
                        <option value="">Selecione...</option>
                        ${investments.map(inv => 
                            `<option value="${inv.id}">${inv.name} (${inv.rate})</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="investmentValue">Valor</label>
                    <input type="text" id="investmentValue" placeholder="R$ 0,00" required>
                </div>
                <button type="submit" class="btn-confirm">Investir</button>
            </form>
        `);
    }

    // ========== EVENT LISTENERS ==========
    // Navegação principal
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            showSection(this.dataset.section);
        });
    });

    // Atalhos
    shortcutPix.addEventListener('click', () => showSection('pix'));
    shortcutRecarga.addEventListener('click', () => {
        showSection('recargas');
        document.getElementById('rechargePhone').focus();
    });
    shortcutEmprestimo.addEventListener('click', () => showSection('emprestimos'));
    shortcutInvestir.addEventListener('click', () => {
        showSection('investimentos');
        showModal('investModal');
    });
    shortcutSeguros.addEventListener('click', () => {
        alert('Redirecionando para página de seguros...');
        // Aqui você pode adicionar redirecionamento real quando tiver a página
    });
    shortcutMais.addEventListener('click', () => {
        alert('Serviço de câmbio de moedas disponível em nossas agências!');
    });

    // Cartões
    bloquearCartaoBtn.addEventListener('click', () => showModal('cardBlockModal'));
    ajustarLimiteBtn.addEventListener('click', () => showModal('limitAdjustModal'));
    cartaoVirtualBtn.addEventListener('click', () => showModal('virtualCardModal'));

    // Minha Conta
    alterarSenhaBtn.addEventListener('click', () => showModal('changePasswordModal'));
    alterarEmailBtn.addEventListener('click', () => showModal('changeEmailModal'));
    alterarTelefoneBtn.addEventListener('click', () => showModal('changePhoneModal'));

    // Botões principais
    pixBtn.addEventListener('click', () => showSection('pix'));
    transferBtn.addEventListener('click', () => showModal('transfer'));
    depositBtn.addEventListener('click', () => showModal('deposit'));
    payBtn.addEventListener('click', () => showSection('pagamentos'));
    investBtn.addEventListener('click', () => {
        showSection('investimentos');
        showModal('investModal');
    });
    supportBtn.addEventListener('click', () => showModal('support'));
    notificationBtn.addEventListener('click', showNotifications);
    filterBtn.addEventListener('click', () => {
        alert('Filtrando transações... (funcionalidade em desenvolvimento)');
    });
    showMoreBtn.addEventListener('click', loadMoreTransactions);
    logoutBtn.addEventListener('click', logout);
    payInvoiceBtn.addEventListener('click', () => showModal('invoice'));
    payFullBtn.addEventListener('click', () => showModal('invoice'));

    // Fechar modais
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-modal') || 
            e.target.classList.contains('modal') ||
            e.target.classList.contains('btn-cancel') ||
            e.target.classList.contains('btn-close-modal')) {
            closeAllModals();
        }
    });

    // ========== FORMULÁRIOS ==========
    // Transferência
    forms.transfer.addEventListener('submit', function(e) {
        e.preventDefault();
        const value = parseFloat(
            this.querySelector('#transferValue').value
                .replace('R$ ', '')
                .replace('.', '')
                .replace(',', '.')
        );
        const to = this.querySelector('#transferTo').value;
        const description = this.querySelector('#transferDescription').value;

        if (!value || !to) {
            alert('Preencha todos os campos obrigatórios!');
            return;
        }

        if (value > saldo) {
            alert('Saldo insuficiente para esta transferência!');
            return;
        }

        saldo -= value;
        addTransaction(`Transferência para ${to}`, value, 'outcome', description);
        alert(`Transferência de ${formatMoney(value)} realizada com sucesso!`);
        closeAllModals();
        this.reset();
        updateUI();
    });

    // PIX
    forms.pix.addEventListener('submit', function(e) {
        e.preventDefault();
        const value = parseFloat(
            this.querySelector('#pixValue').value
                .replace('R$ ', '')
                .replace('.', '')
                .replace(',', '.')
        );
        const key = this.querySelector('#pixKey').value;
        const description = this.querySelector('#pixDescription').value;

        if (!value || !key) {
            alert('Preencha todos os campos obrigatórios!');
            return;
        }

        if (value > saldo) {
            alert('Saldo insuficiente para esta transferência PIX!');
            return;
        }

        saldo -= value;
        addTransaction(`PIX para ${key}`, value, 'outcome', description);
        alert(`PIX de ${formatMoney(value)} realizado com sucesso para ${key}!`);
        this.reset();
        updateUI();
    });

    // Depósito
    forms.deposit.addEventListener('submit', function(e) {
        e.preventDefault();
        const value = parseFloat(
            this.querySelector('#depositValue').value
                .replace('R$ ', '')
                .replace('.', '')
                .replace(',', '.')
        );

        if (!value) {
            alert('Informe o valor do depósito!');
            return;
        }

        saldo += value;
        addTransaction(`Depósito`, value, 'income');
        alert(`Depósito de ${formatMoney(value)} realizado com sucesso!`);
        closeAllModals();
        this.reset();
        updateUI();
    });

    // Fatura do cartão
    forms.invoice.addEventListener('submit', function(e) {
        e.preventDefault();
        const value = parseFloat(
            this.querySelector('#invoiceValue').value
                .replace('R$ ', '')
                .replace('.', '')
                .replace(',', '.')
        );

        if (!value) {
            alert('Informe o valor do pagamento!');
            return;
        }

        if (value > saldo) {
            alert('Saldo insuficiente para pagar esta fatura!');
            return;
        }

        saldo -= value;
        faturaCartao = Math.max(0, faturaCartao - value);
        addTransaction(`Pagamento de fatura`, value, 'outcome', `Cartão final 7890`);
        alert(`Pagamento de ${formatMoney(value)} na fatura do cartão realizado com sucesso!`);
        closeAllModals();
        this.reset();
        updateUI();
    });

    // Suporte
    forms.support.addEventListener('submit', function(e) {
        e.preventDefault();
        const subject = this.querySelector('#supportSubject').value;
        const message = this.querySelector('#supportMessage').value;

        if (!message) {
            alert('Descreva seu problema!');
            return;
        }

        alert(`Mensagem enviada com sucesso!\nAssunto: ${subject}\n\nEm breve entraremos em contato.`);
        closeAllModals();
        this.reset();
    });

    // Bloquear cartão
    document.querySelector('.btn-confirm-block')?.addEventListener('click', function() {
        cartaoBloqueado = !cartaoBloqueado;
        alert(`Cartão ${cartaoBloqueado ? 'bloqueado' : 'desbloqueado'} com sucesso!`);
        closeAllModals();
        updateUI();
    });

    // Ajustar limite
    forms.limitAdjust?.addEventListener('submit', function(e) {
        e.preventDefault();
        const newLimit = parseFloat(
            this.querySelector('#newLimit').value
                .replace('R$ ', '')
                .replace('.', '')
                .replace(',', '.')
        );

        if (!newLimit || newLimit < 1000) {
            alert('O limite mínimo é R$ 1.000,00');
            return;
        }

        limiteCartao = newLimit;
        limiteDisponivel = newLimit - faturaCartao;
        alert(`Limite do cartão ajustado para ${formatMoney(newLimit)}`);
        closeAllModals();
        updateUI();
    });

    // Alterar senha
    forms.changePassword?.addEventListener('submit', function(e) {
        e.preventDefault();
        const current = this.querySelector('#currentPassword').value;
        const newPass = this.querySelector('#newPassword').value;
        const confirm = this.querySelector('#confirmPassword').value;

        if (current !== userData.senha) {
            alert('Senha atual incorreta!');
            return;
        }

        if (newPass !== confirm) {
            alert('As novas senhas não coincidem!');
            return;
        }

        if (newPass.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        userData.senha = newPass;
        alert('Senha alterada com sucesso!');
        closeAllModals();
        this.reset();
    });

    // Alterar email
    forms.changeEmail?.addEventListener('submit', function(e) {
        e.preventDefault();
        const newEmail = this.querySelector('#newEmail').value;
        const confirm = this.querySelector('#confirmEmail').value;

        if (newEmail !== confirm) {
            alert('Os e-mails não coincidem!');
            return;
        }

        if (!newEmail.includes('@') || !newEmail.includes('.')) {
            alert('Informe um e-mail válido!');
            return;
        }

        userData.email = newEmail;
        alert('E-mail alterado com sucesso!');
        closeAllModals();
    });

    // Alterar telefone
    forms.changePhone?.addEventListener('submit', function(e) {
        e.preventDefault();
        const newPhone = this.querySelector('#newPhone').value;

        if (newPhone.replace(/\D/g, '').length < 10) {
            alert('Informe um telefone válido!');
            return;
        }

        userData.telefone = newPhone;
        alert('Telefone alterado com sucesso!');
        closeAllModals();
    });

    // Investimento
    forms.investForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        const type = this.querySelector('#investmentType').value;
        const value = parseFloat(
            this.querySelector('#investmentValue').value
                .replace('R$ ', '')
                .replace('.', '')
                .replace(',', '.')
        );

        if (!type) {
            alert('Selecione um tipo de investimento!');
            return;
        }

        const investment = investments.find(inv => inv.id == type);
        
        if (value < investment.minValue) {
            alert(`O valor mínimo para este investimento é ${formatMoney(investment.minValue)}`);
            return;
        }

        if (value > saldo) {
            alert('Saldo insuficiente para este investimento!');
            return;
        }

        saldo -= value;
        addTransaction(`Investimento em ${investment.name}`, value, 'outcome', `Taxa: ${investment.rate}`);
        alert(`Investimento de ${formatMoney(value)} em ${investment.name} realizado com sucesso!`);
        closeAllModals();
        this.reset();
        updateUI();
    });

    // ========== FUNÇÕES ADICIONAIS ==========
    function loadMoreTransactions() {
        const moreTransactions = [
            { name: "Netflix", amount: 39.90, type: "outcome", desc: "Assinatura mensal" },
            { name: "Salário", amount: 5200.00, type: "income", desc: "Empresa XYZ" },
            { name: "Supermercado", amount: 327.45, type: "outcome", desc: "Mercado Central" }
        ];

        moreTransactions.forEach(t => {
            addTransaction(t.name, t.amount, t.type, t.desc);
        });

        showMoreBtn.textContent = "Não há mais transações";
        showMoreBtn.disabled = true;
    }

    function showLoanSimulation() {
        document.querySelector('.loan-offer').style.display = 'none';
        document.querySelector('.loan-simulation').style.display = 'block';
    }

    function requestLoan() {
        alert('Solicitação de empréstimo enviada para análise!\nVocê receberá uma resposta em até 2 dias úteis.');
        closeAllModals();
    }

    forms.loan?.addEventListener('submit', function(e) {
        e.preventDefault();
        const value = parseFloat(
            this.querySelector('#loanValue').value
                .replace('R$ ', '')
                .replace('.', '')
                .replace(',', '.')
        );
        const installments = parseInt(this.querySelector('#loanInstallments').value);
        const purpose = this.querySelector('input[name="loanPurpose"]:checked').value;

        if (!value) {
            alert('Informe o valor desejado!');
            return;
        }

        // Simulação simples com taxa de 1.49% ao mês
        const monthlyRate = 1.0149;
        const monthlyPayment = (value * Math.pow(monthlyRate, installments)) / installments;
        const total = monthlyPayment * installments;

        document.querySelector('.loan-simulation').style.display = 'none';
        document.querySelector('.loan-result').style.display = 'block';
        
        document.getElementById('simulatedValue').textContent = formatMoney(value);
        document.getElementById('simulatedInstallments').textContent = `${installments}x`;
        document.getElementById('simulatedRate').textContent = '1,49% a.m.';
        document.getElementById('simulatedMonthly').textContent = formatMoney(monthlyPayment);
        document.getElementById('simulatedTotal').textContent = formatMoney(total);
    });

    function logout() {
        localStorage.removeItem('zentry_logged_in');
        window.location.href = 'index.html';
    }

    // ========== INICIALIZAÇÃO ==========
    function init() {
        applyInputMasks();
        initModals();
        updateUI();
        showSection('inicio');

        // Adicionar transações iniciais
        const initialTransactions = [
            { name: "Amazon", amount: 129.90, type: "outcome", desc: "Compra online" },
            { name: "Transferência recebida", amount: 500.00, type: "income", desc: "João Silva" },
            { name: "Restaurante", amount: 87.50, type: "outcome", desc: "Jantar" }
        ];

        initialTransactions.forEach(t => {
            addTransaction(t.name, t.amount, t.type, t.desc);
        });
    }

    init();
});