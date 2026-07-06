(function() {
  if (!window.SupportAgentConfig || !window.SupportAgentConfig.companyId) {
    console.error('SupportAgent: window.SupportAgentConfig.companyId is required');
    return;
  }

  const { companyId, origin } = window.SupportAgentConfig;

  // Create stylesheet
  const style = document.createElement('style');
  style.textContent = `
    .support-agent-widget-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .support-agent-bubble-button {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      border: none;
      outline: none;
    }
    .support-agent-bubble-button:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 24px rgba(79, 70, 229, 0.5);
    }
    .support-agent-bubble-button svg {
      width: 28px;
      height: 28px;
      fill: none;
      stroke: white;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .support-agent-chat-frame {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 580px;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      background: white;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateY(20px) scale(0.95);
      transition: opacity 0.25s ease, transform 0.25s ease, display 0.25s ease;
      display: none;
    }
    .support-agent-chat-frame.active {
      display: block;
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    @media (max-width: 480px) {
      .support-agent-chat-frame {
        width: calc(100vw - 48px);
        height: calc(100vh - 120px);
        bottom: 70px;
        right: -12px;
      }
    }
  `;
  document.head.appendChild(style);

  // Create widget containers
  const container = document.createElement('div');
  container.className = 'support-agent-widget-container';

  const frame = document.createElement('iframe');
  frame.className = 'support-agent-chat-frame';
  frame.src = `${origin}/embed/chat?companyId=${companyId}`;
  frame.allow = "microphone";
  frame.style.border = 'none';

  const button = document.createElement('button');
  button.className = 'support-agent-bubble-button';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

  let isOpen = false;
  button.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      frame.style.display = 'block';
      setTimeout(() => {
        frame.classList.add('active');
      }, 50);
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    } else {
      frame.classList.remove('active');
      setTimeout(() => {
        if (!isOpen) frame.style.display = 'none';
      }, 250);
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
    }
  });

  container.appendChild(frame);
  container.appendChild(button);
  document.body.appendChild(container);
})();
