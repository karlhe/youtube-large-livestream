// Script to be injected into the page
(() => {
  const player = document.getElementById('movie_player');
  // There's actually 2 elements with id secondary...?
  // Specifically want the one under #columns
  const secondary = document.querySelector('#columns #secondary');

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

      // This should catch both resizing and if theatre mode is toggled
      // Easier than making another observer
      setChatSize();
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
    // Captures clip mode toggling and collapsing chat
    new MutationObserver(function(_mutationsList, _observer) {
      setChatSize();
    }).observe(document.querySelector('#columns #secondary-inner'), {
      childList: true,
      attributes: true,
      subtree: true,
    });
  };

  if (player && player.getElementsByTagName('video')[0]) {
    const video = player.getElementsByTagName('video')[0];
    createObserver(video, player);
    setVideoSize(player);
  } else {
    // Wait for the video element to exist
    new MutationObserver((_mutationsList, observer) => {
      const player = document.getElementById('movie_player');
      if (player) {
        const video = player.getElementsByTagName('video')[0];
        if (video) {
          createObserver(video, player);
          setVideoSize(player);
          observer.disconnect();
        }
      }
    }).observe(document, {
      subtree: true,
      childList: true,
    });
  }

  // As far as I can tell secondary always exists, but just in case
  if (secondary) {
    createChatObserver(secondary);
  } else {
    // Wait for the chat element to exist
    new MutationObserver((_mutationsList, observer) => {
      const secondary = document.querySelector('#columns #secondary');
      if (secondary) {
        createChatObserver();
        observer.disconnect();
      }
    }).observe(document, {
      subtree: true,
      childList: true,
    });
  }

})();
