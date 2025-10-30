
// Element References
const noteModal = document.querySelector('#noteModal');
const closeModalBtn = document.querySelector('#closeModal');
const openModalBtn = document.querySelector('#openModal');
const addNoteBtn = document.querySelector('#addNoteBtn');
const noteForm = document.querySelector('#noteForm');
const addNoteTitle = document.querySelector('#addNoteTitle');
const addNoteContent = document.querySelector('#addNoteContent');
const notesWrapper = document.querySelector('.notes-wrapper');
const clearAllNoteBtn = document.querySelector('#clearNoteBtn');
const colorFilter = document.querySelector('#colorFilter');
const colorOptions = document.querySelector('#colorOptions');
const showAllBtn = document.querySelector('#showAll');
const searchInput = document.querySelector('#searchInput');

// Color Options
let notesBg = ['#fec971', '#fe9b72', '#b194fd', '#00d4fe', '#e3ee8f'];

let selectedColor = notesBg[0];
let notesArray = [];
let handleUpdate = null;

// Utilities
// Format Timestamp
let convertTimestamp = (timestamp) => {
    let dateObj = new Date(timestamp);
    let options = { year: 'numeric', month: 'short', day: 'numeric' };
    return dateObj.toLocaleDateString(undefined, options);
}

// Save and load from Localstorage
const saveNotes = () => {
    localStorage.setItem('notes', JSON.stringify(notesArray))
}

const loadNotes = () => {
    try{
        return JSON.parse(localStorage.getItem('notes')) || [];
    }catch{
        return [];
    }
}

// Modal handlers

// Show and close modal
const showModal = () =>  {
    noteModal.showModal();
    addNoteTitle.focus();
}

const closeModal = () => {
    noteModal.close();
    noteForm.reset(); 
    selectedColor = notesBg[0]; // reset to default color
    renderColorOptions(); // refresh the color picker
    addNoteBtn.textContent = "Add Note"; // reset button text
    // clean up event listeners
    noteForm.removeEventListener('submit', handleUpdate);
    noteForm.removeEventListener('submit', addNewNotes);
    noteForm.addEventListener('submit', addNewNotes);
};

openModalBtn.addEventListener('click', showModal);
closeModalBtn.addEventListener('click', closeModal);

// Close modal if clicked outside
noteModal.addEventListener('click', (e) => {
    const dialogDimension = noteModal.getBoundingClientRect();
    const clickedOutside = e.clientX < dialogDimension.left || e.clientX > dialogDimension.right || e.clientY < dialogDimension.top || e.clientY > dialogDimension.bottom
    if(clickedOutside) closeModal();
});

// Create Color picker circles in modal
const renderColorOptions = () => {
    colorOptions.innerHTML = notesBg.map((clr) => {
        return ` <div class="color-circle w-6 h-6 rounded-full cursor-pointer border-2 ${clr === selectedColor ? 'border-black' : 'border-transparent'}" style="background-color: ${clr}" data-color=${clr}></div>`
    }).join('');
};

colorOptions.addEventListener('click', (e) => {
    if(e.target.classList.contains('color-circle')){
        selectedColor = e.target.dataset.color;
        renderColorOptions();
    }
});



// Notes Render Functions
const getNoteHTML = (note) => {
    return `<div class="note w-full sm:w-[calc(50%-20px)] xl:w-[300px] rounded-[10px] p-4 bg-lime-500 flex flex-col relative group self-start" data-id="${
      note.id
    }" style="background-color: ${note.color}">
    <div class="note-title text-xl font-[500]">${note.title}</div>
    <p class="note-content text-[16px]">${note.content}</p>
    <div class="note-footer flex items-center justify-between pt-6">
      <div class="note-time-stamp text-[13px]">
        ${convertTimestamp(note.id)}
      </div>
      <div class="actions flex gap-3">
        <button class="edit-note text-[13px] font-[500] cursor-pointer text-black ">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 pointer-events-none">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
        </button>
        <button class="delete-note text-[13px] font-[500] cursor-pointer text-black sm:opacity-0 group-hover:opacity-100 transition-opacity sm:absolute sm:right-[10px] sm:top-[10px]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 pointer-events-none">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>

        </button>
      </div>
    </div>
  </div>`;
};

const renderNotes = (notesToRender = notesArray, isFiltered = false) => {
    if(!notesToRender.length){
        if(!notesArray.length){
            notesWrapper.innerHTML = `<div class="text-[20px] sm:text-[30px] text-center absolute top-[45%] left-0 w-full px-3">Click the <b>Add Note</b> button to create your first one!</div>`;
            clearAllNoteBtn.style.display = 'none';
            searchInput.style.display = 'none';
        }else if(!isFiltered){
            notesWrapper.innerHTML = `<div class="text-xl text-center pt-[50px] w-full">No Results found...</div>`;
            clearAllNoteBtn.style.display = 'none';
        }
        return;
    }
        

    notesWrapper.innerHTML = notesToRender.map(getNoteHTML).join('');
    clearAllNoteBtn.style.display = 'block';
    searchInput.style.display = 'block';

    renderColorFilter();
}

// Note Handlers
const addNewNotes = (e) => {
    e.preventDefault();
    addNoteBtn.textContent = "Update Note" ? "Add Note" : "Add Note";
    const title = addNoteTitle.value.trim();
    const content = addNoteContent.value.trim();

    if(!title || !content) return alert("Please enter Title and Content...")
    
    const newNote = {
        id: Date.now(),
        title, 
        content,
        color: selectedColor
    }

    notesArray.unshift(newNote);
    renderNotes();
    saveNotes();
    noteForm.reset();
    selectedColor = notesBg[0];
    renderColorOptions();
    closeModal();
}

noteForm.addEventListener('submit', addNewNotes)

const handleDelete = (id) => {
    if(!confirm('Are you sure you want to delete this note?')) return;
    notesArray = notesArray.filter(note => note.id !== id);
    saveNotes();
    renderNotes();
}

const handleEdit = (id) => {
    const noteToEdit = notesArray.find(note => note.id === id);
    if(!noteToEdit) return;
    addNoteBtn.textContent = "Update Note";
    // Prefill Form to edit
    addNoteTitle.value = noteToEdit.title;
    addNoteContent.value = noteToEdit.content;
    selectedColor = noteToEdit.color;
    renderColorOptions();
    showModal();

    noteForm.removeEventListener('submit', addNewNotes);

    handleUpdate = (e) => {
        e.preventDefault();
        noteToEdit.title = addNoteTitle.value.trim();
        noteToEdit.content = addNoteContent.value.trim();
        noteToEdit.color = selectedColor

        saveNotes();
        renderNotes();
        closeModal();
    }

    noteForm.addEventListener('submit', handleUpdate);
};

// Event Deligation for Edit and Delete
notesWrapper.addEventListener('click', (e) => {
    const noteCard = e.target.closest('.note');
    if(!noteCard) return;
    const noteID = Number(noteCard.dataset.id);

    if(e.target.classList.contains('edit-note')){
        handleEdit(noteID);
    }else if (e.target.classList.contains('delete-note')){
        handleDelete(noteID);
    }
});

// Clear all notes
const clearNotes = () => {
    if(!notesArray.length) return;
    if(!confirm("Are you sure to delete all the notes?")) return;
    notesArray = [];
    localStorage.removeItem('notes');
    colorFilter.innerHTML = ''
    renderNotes();
}

clearAllNoteBtn.addEventListener('click', clearNotes);

// Filter based on Color
const renderColorFilter = () => {
    const uniqueColors = [...new Set(notesArray.map((note) => note.color))];
    if(notesArray.length <= 2 || uniqueColors.length === 0){
        colorFilter.style.display ="none";
        showAllBtn.style.display = "none";
        return
    }

    colorFilter.style.display = "flex";

    colorFilter.innerHTML = uniqueColors.map(clr => {
        return `<div class="filter-circle w-6 h-6 rounded-full cursor-pointer border-2 border-gray-300" style="background:${clr}" data-color="${clr}"></div>`;
    }).join('');
}

colorFilter.addEventListener('click', (e) => {
    if (e.target.classList.contains("filter-circle")) {
      const color = e.target.dataset.color;
      const filterNotes = notesArray.filter((note) => note.color === color);
      renderNotes(filterNotes); 
      showAllBtn.style.display = "block"
      
    // highlight active filter
      Array.from(colorFilter.children).forEach(
        (el) =>
          (el.style.outline =
            el.dataset.color === color ? "3px solid #00000033" : "")
      );
    }
})

showAllBtn.addEventListener('click', () => {
    renderNotes()
    // remove any active filter highlight
    Array.from(colorFilter.children).forEach(
        (el) => (el.style.outline = "")
    );
    showAllBtn.style.display = "none"
});

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if(!query){
        renderNotes();
        return
    }

    const filteredNotes = notesArray.filter(note => note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query));
    renderNotes(filteredNotes);
})

// Initial Load
const init = () => {
    notesArray = loadNotes();
    renderNotes();
    renderColorOptions();
}

document.addEventListener('DOMContentLoaded', init);





