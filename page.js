// Script to be injected into the page
(() => {
  const player = document.getElementById('movie_player');

  // This uses undocumented APIs, hopefully they continue to exist
  const setVideoSize = (player) => {
    const { width, height } = player.getPlayerSize();

    // Our change will also trigger the mutation observer
    // Make sure we don't infinite loop
    if (width < player.clientWidth || height < player.clientHeight) {
      player.setInternalSize(player.clientWidth, player.clientHeight);
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
      attributeFilter: ['style'],
    });
  }

  if (player && player.getElementsByTagName('video')[0]) {
    const video = player.getElementsByTagName('video')[0];
    createObserver(video, player);
    setVideoSize(player);
  } else {
    // Wait for the video element to exist
    new MutationObserver(function(_mutationsList, _observer) {
      const player = document.getElementById('movie_player');
      if (player) {
        const video = player.getElementsByTagName('video')[0];
        if (video) {
          createObserver(video, player);
          setVideoSize(player);
          this.disconnect();
        }
      }
    }).observe(document, {
      subtree: true,
      childList: true,
    })
  }

})();
