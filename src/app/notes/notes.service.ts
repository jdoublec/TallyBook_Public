import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';
import { Note } from './notes.model';

@Injectable({providedIn: 'root'})
export class NotesService {
    notesChanged = new Subject<Note[]>();
    notes: Note[] = [
    ];
    

    setNotes(notes: Note[]) {
        this.notes = notes;
    }

    getNotes() {
        return this.notes.slice();
    }

    // getNote(index: number) {
    //     //return this.notes[index];

    //     let tempTime = this.notes[index].time;
    //     let tempDate = this.notes[index].date;
    //     let tempType = this.notes[index].type;
    //     let tempNote = this.notes[index].note;

    //     new Note(tempTime, tempDate, tempType, tempNote);
    // }

    updateNote(index: number, time: Date, date: Date, type: string, note: string) {
        this.notes.splice(index, 1);
        this.addNote(time, date, type, note);
        //this.notesChanged.next(this.notes.slice());
    }

    addNote(time: Date, date: Date, type: string, note: string) {
        const milliDate = Date.parse(date.toString());
        let noteAdded: Boolean = false;
        let newTime = time[0].toString() + time[1].toString() + time[3].toString() + time[4].toString();
        const newNote = new Note(time, date, type, note);
        if (this.notes.length > 0) {
            if (this.notes.filter(note => Date.parse(note.date.toString()) === milliDate).length > 0) {    
                for(let i = (this.notes.length - 1); i >= 0; i--) {
                    if (Date.parse(this.notes[i].date.toString()) === milliDate) {
                        let noteTime = this.notes[i].time[0].toString() + this.notes[i].time[1].toString() + this.notes[i].time[3].toString() + this.notes[i].time[4].toString();                                                                                                                
                        if (noteTime < newTime) {                            
                            if (i === (this.notes.length - 1)) {
                                this.notes.push(newNote);
                                noteAdded = true;
                                break;
                            } else {
                                this.notes.splice(i + 1, 0, newNote);
                                noteAdded = true;
                                break;
                            }
                        } else {
                            if (i === 0) {
                                this.notes.splice(i, 0, newNote);
                                noteAdded = true;
                                break;
                            } else if (Date.parse(this.notes[i - 1].date.toString()) === milliDate) {
                                noteTime = this.notes[i - 1].time[0].toString() + this.notes[i - 1].time[1].toString() + this.notes[i - 1].time[3].toString() + this.notes[i - 1].time[4].toString();                                              
                                if (noteTime < newTime) {  
                                    this.notes.splice(i, 0, newNote);
                                    noteAdded = true;
                                    break;
                                }
                            } else {   
                                this.notes.splice(i, 0, newNote);
                                noteAdded = true;
                                break;
                            }
                        }
                    }
                }
                
                if (!noteAdded) {
                    this.notes.push(newNote);
                }
            }    
            else 
            {
                for(let i = (this.notes.length - 1); i >= 0; i--) {
                    if (Date.parse(this.notes[i].date.toString()) < milliDate) {
                        if (i === (this.notes.length - 1)) {
                            this.notes.push(newNote);
                            noteAdded = true;
                            break;
                        } else {
                            this.notes.splice(i + 1, 0, newNote);
                            noteAdded = true;
                            break;
                        }
                    }
                }

                if (!noteAdded) {
                    this.notes.splice(0, 0, newNote);
                }
            }  
        } else {
            this.notes.push(newNote);
        }
        this.notesChanged.next(this.notes.slice());     
    }

    removeNote(index: number) {
        this.notes.splice(index, 1);
        this.notesChanged.next(this.notes.slice());
    }

    doesNoteTimeExist(timeToAdd: Date, dateToAdd: Date, indexToIgnore: number) {
        let newTime = timeToAdd[0].toString() + timeToAdd[1].toString() + timeToAdd[3].toString() + timeToAdd[4].toString();
        let noteTimeExists: Boolean = false;
        const milliDate = Date.parse(dateToAdd.toString());

        this.notes.forEach((note, index) => {
            if (Date.parse(note.date.toString()) === milliDate) {
                let noteTime = note.time[0].toString() + note.time[1].toString() + note.time[3].toString() + note.time[4].toString();               
                if (index !== indexToIgnore) {  
                    if (noteTime === newTime) {
                        noteTimeExists = true;
                    }   
                }
            }
        })
        return noteTimeExists;
    }
}