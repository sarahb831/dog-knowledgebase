(function() {
  var data = {};

  var $modalContainer = $('#modal-container');

  var dogRepository = (function() {
    var repository = [];
    var apiUrl = 'https://dog.ceo/api/breeds/list/all';

    /* check for empty repository
      return true if empty, false otherwise
    */
    function isRepositoryEmpty(repository) {
      if (repository.length > 0) {
        return false;
      }
      return true;
    }

    /* compares keys for two objects, returning true if all match, false
        otherwise
    */
    function isKeyMatch(object1, object2) {
      var object1Keys = Object.keys(object1);
      var object2Keys = Object.keys(object2);

      for (var i = 0; i < object1Keys.length; i++) {
        if (object1Keys[i] !== object2Keys[i]) {
          return false; // not the same key
        }
        return true; // if made it here, all keys match
      }
    }

    /* get the list of items from the api
     */
    function loadList() {
      return $.ajax(apiUrl, { dataType: 'json' })
        .then(function(data) {
          var dogs = Object.keys(data.message); // the keys for data I want
          for (var i = 0; i < dogs.length; i++) {
            var dogData = {
              name: dogs[i],
              detailsUrl:
                'https://dog.ceo/api/breed/' + dogs[i] + '/images/random'
            };
            add(dogData);
          }
        })
        .catch(function(e) {
          console.error(e);
        });
    }

    /* load the details for the specified item
     */
    function loadDetails(item) {
      var url = 'https://dog.ceo/api/breed/' + item.name + '/images/random';
      return $.ajax(url, { dataType: 'json' })
        .then(function(details) {
          item.imageUrl = details.message;
        })
        .catch(function(e) {
          console.error(e);
        });
    }

    /* returns the object from the repository for the given name
     */

    function search(name) {
      for (var i = 0; i < repository.length; i++) {
        if (repository[i].name === name) {
          return repository[i];
        }
      }
      return null; // if no match
    }

    function getAll() {
      return repository;
    }

    /* add item to repository
     */
    function add(dog) {
      if (
        typeof dog === 'object' &&
        (isRepositoryEmpty(repository) || isKeyMatch(repository[0], dog))
      ) {
        repository.push(dog);
      } else console.warn('Not valid dog data, item not added!');
    }

    // for dogRepository
    return {
      add: add,
      getAll: getAll,
      search: search,
      loadList: loadList,
      loadDetails: loadDetails
    };
  })(); // dogRepository end

  dogRepository.loadList().then(function() {
    var dogs = dogRepository.getAll();
    for (var i = 0; i < dogs.length; i++) {
      addListItem(dogs[i]);
    }
  });

  function showModal(item) {
    $modalContainer.text('');

    var modal = $('div');
    //modal.addClass('modal');

    // add new modal content
    var closeButtonElement = $('<button class="modal-close">Close</button>').on(
      'click',
      hideModal
    );
    var titleElement = $('<h1>' + item.name + '</h1>');
    var imageElement = $(
      '<img src=' +
        item.imageUrl +
        ' class = "dog-image" alt = "' +
        item.name +
        ' picture" >'
    );

    modal.append(closeButtonElement);
    modal.append(titleElement);
    modal.append(imageElement);

    $modalContainer.append(modal);
    $modalContainer.addClass('is-visible');
  } // end showModal()

  function hideModal() {
    $modalContainer.removeClass();
  }

  /* show details of items
   */
  function showDetails(itemName) {
    var item = dogRepository.search(itemName); // get object for this itemName
    dogRepository.loadDetails(item).then(function(itemUrl) {
      showModal(item);
    });
  }

  /* adds item to display as a button
   */
  function addListItem(dog) {
    // add new DOM li imageElement
    var $element = $('.item-list');
    var newLi = $('<li id=' + dog.name + ' class="item-list__item"></li>');
    var button = $('<button>' + dog.name + '</button>');
    newLi.append(button);
    $element.append(newLi);
    button.on('click', function(event) {
      var clickId = $(event.target).text();
      showDetails(clickId);
    });
  }

  // exit modal gracefully on escape key press
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $modalContainer.attr('class') === 'is-visible') {
      hideModal();
    }
  });

  $modalContainer.on('click', e => {
    // close if user clicks on overlay
    hideModal();
  });
})();
