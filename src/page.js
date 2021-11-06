// Script to be injected into the page
(() => {
  const player = document.getElementById('movie_player');
  const secondary = document.getElementById('secondary');

  // This uses undocumented APIs, hopefully they continue to exist
  const setVideoSize = (player) => {
    const { width, height } = player.getPlayerSize();

    // Our change will also trigger the mutation observer
    // Make sure we don't infinite loop
    if (width < player.clientWidth || height < player.clientHeight) {
      player.setInternalSize(player.clientWidth, player.clientHeight);
    }
  };

  const setChatSize = () => {
    const chat = document.getElementById('chat');
    if (chat) {
      // This looks weird, but chat's offsetParent actually changes depending on
      // whether or not chat is enabled, throwing off the calculation
      const height = window.innerHeight - chat.offsetTop - chat.offsetParent.offsetTop - 24;
      if (!chat.hasAttribute('collapsed') && height > 720) {
        // Only set if it would actually expand chat
        chat.style.height = `${height}px`;
      } else {
        // Otherwise, remove styling
        chat.style.height = '';
      }
    }
  };

  const createObserver = (video, player) => {
    // Don't actually need to look at the mutation, mainly need to observe whether
    // the page has attempted to resize the video so that we can set it to our
    // preferred size
    new MutationObserver((_mutationsList, _observer) => {
      setVideoSize(player);
    }).observe(video, {
      attributes: true,
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        setVideoSize(player);
      }
    }, false);
  };

  const createChatObserver = () => {
    // This observer is pretty broad, might be room to optimize this?
    new MutationObserver((_mutationsList, _observer) => {
      setChatSize();
    }).observe(secondary, {
      attributes: true,
      subtree: true,
    });
  };

  if (player && player.getElementsByTagName('video')[0]) {
    const video = player.getElementsByTagName('video')[0];
    createObserver(video, player);
    createChatObserver();
    setVideoSize(player);
  } else {
    // Wait for the video element to exist
    new MutationObserver(function(_mutationsList, _observer) {
      const player = document.getElementById('movie_player');
      if (player) {
        const video = player.getElementsByTagName('video')[0];
        if (video) {
          createObserver(video, player);
          createChatObserver();
          setVideoSize(player);
          this.disconnect();
        }
      }
    }).observe(document, {
      subtree: true,
      childList: true,
    });
  }

})();
