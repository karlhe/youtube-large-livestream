const script = document.createElement('script');
script.src = chrome.runtime.getURL('page.js');
script.onload = () => script.remove();
document.head.appendChild(script);
