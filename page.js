// Script to be injected into the page
(() => {
  const player = document.getElementById('movie_player');
  const video = player.getElementsByTagName('video')[0];

  // This uses undocumented APIs, hopefully they continue to exist
  const setVideoSize = () => {
    const { width, height } = player.getPlayerSize();

    // Our change will also trigger the mutation observer
    // Make sure we don't infinite loop
    if (width < player.clientWidth || height < player.clientHeight) {
      player.setInternalSize(player.clientWidth, player.clientHeight);
      console.log('resized', player.getPlayerSize());
    }
  };

  // Don't actually need to look at the mutation, mainly need to observe whether
  // the page has attempted to resize the video so that we can set it to our
  // preferred size
  new MutationObserver((_mutationsList, _observer) => {
    setVideoSize();
  }).observe(video, {
    attributes: true,
    attributeFilter: ['style'],
  });

  setVideoSize();
})();
