const fields = ['PLAYER', 'TAG', 'WS', 'FKDR', 'WLR', 'BBLR'];

let mode;

const sortTable = (tableName) => {
    const table = document.getElementById(tableName);
    let rows, i, x, y, shouldSwitch;
    let switching = true;
    while(switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            /* Get the two elements you want to compare,
            one from current row and one from the next: */
            x = rows[i].getElementsByTagName('TD')[3];
            y = rows[i + 1].getElementsByTagName('TD')[3];
            // Check if the two rows should switch place:
            if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                // If so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
};

// table updating functions from main

window.players.display('showPlayers', (data) => {
    const table = document.getElementById('main-table');
    table.innerHTML = ''; // reset table
    // create the header row and add the field titles to it
    const headrow = document.createElement('tr');
    fields.forEach(field => {
        headrow.innerHTML += `<th>${field}</th>`;
    });
    table.appendChild(headrow);

    
    data.forEach(player => { // for each player, create a row and populate each field with ...
        const node = document.createElement('tr');
        node.setAttribute('id', player);
        fields.forEach(field => {
            if(field === 'PLAYER') node.innerHTML += `<td>${player}</td>`;
            else node.innerHTML += '<td>...</td>';
        });
        table.appendChild(node);
    });
});

window.players.update('updatePlayer', (data) => {
    const playerRow = document.getElementById(data.user); // find the player row
    playerRow.innerHTML = ''; // reset the player row's data

    //if the player is not a nick, color them according to their threat level
    if(!data.nick) {
        const rgb = data.stats.bedwars[mode].color;
        $(`#${data.user}`).css('color', `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
    }
    else {
        playerRow.classList.add('nick');
    }
    // populate each field with the necessary data
    fields.forEach(field => {
        let fieldContent;
        switch(field.toLowerCase()) {
        case 'player':
            fieldContent = `${data.nick ? `${data.user}` : `${data.coloredstar} ${data.displayName}`}`;
            break;
        case 'tag':
            fieldContent = data.nick ? 'NICK' : '';
            break;
        default:
            fieldContent = data.nick ? 'NICK' : data.stats.bedwars[mode][field.toLowerCase()] || '0';
            break;
        }
        playerRow.innerHTML += `<td${field !== 'PLAYER' ? ' class=\"centered\"' : ''}>${fieldContent}</td>`;
    });
    sortTable('main-table'); // re sort the table
});

window.players.add('addPlayer', (player) => {
    const table = document.getElementById('main-table');
    const node = document.createElement('tr'); // create a new row for the player
    node.setAttribute('id', player);

    // populate it with the default ...
    fields.forEach(e => {
        if(e === 'PLAYER') node.innerHTML += `<td>${player}</td>`;
        else node.innerHTML += '<td>...</td>';
    });
    table.appendChild(node);
});

window.players.delete('deletePlayer', (player) => {
    // find the row corresponding to the player, and if it exists, delete it
    const row = document.getElementById(player);
    if(row) row.parentNode.removeChild(row);
});

// settings functions

window.settings.initSettings('initSettings', (settings) => {
    $(`#${settings.client}`).prop('selected', true);
    $('#autowho').prop('checked', settings.autowho);
    $(`#${settings.mode}`).prop('selected', true);
    mode = settings.mode;
});

window.settings.invalidKey('invalidKey', () => {
    $('#notice-text').text('INVALID KEY');
});

window.settings.validKey('validKey', () => {
    $('#notice-text').text('');
});

window.settings.noticeText('noticeText', (text) => {
    $('#notice-text').text(text);
});

let settingsClicked = false;
let transitioning = false;

$('#settings-button').click(() => {
    const transitionLength = 500;
    if(!transitioning) {
        transitioning = true;
        if(settingsClicked) {
            $('#settings-button').removeClass('clicked');
            $('#settings-button').css('transform','rotate(0deg)');
            $('#settings').animate({top: '-12em'}, transitionLength);
        }
        else {
            $('#settings-button').addClass('clicked');
            $('#settings-button').css('transform','rotate(180deg)');
            $('#settings').animate({top: '10em'}, transitionLength);
        }
    }
    setTimeout(() => {
        transitioning = false;
        settingsClicked = !settingsClicked;
    }, transitionLength);
});

$('#client-select').change(async () => {
    await window.settings.clientSelect($('#client-select :selected').val());
});

$('#autowho').change(async (data) => {
    await window.settings.autowhoToggle(data.target.checked);
});

$('#mode-select').change(async () => {
    mode = $('#mode-select :selected').val();
    await window.settings.modeSelect(mode);
});