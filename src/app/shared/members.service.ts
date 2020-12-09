import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';
import { User } from '../auth/user.model';

export class Members {
    constructor(
    admin: string,
    readers?: {reader: string},
    writers?: {writer: string},) {}
}

@Injectable ({providedIn: 'root'})
export class MembersService {
    membersChanged = new Subject<Members>();
    adminStatusChanged = new Subject<boolean>();
    memberPermissionsChanged = new Subject<boolean>();
    members: Members;
    isAdmin: boolean = false;
    readOnlyAccess: boolean = true;

    users: String[] = [];
    
    getMembers() {
        let membersTemp = this.members;
        return membersTemp;
    }

    setMembers(members: Members) {
        this.members = members;
        this.membersChanged.next(this.members);
    }

    addMember(readAccess: boolean, userID: string, email: string) {
        if (readAccess) {
            if ('readers' in this.members) {
                Object.assign(this.members['readers'], {[userID]: email});
            } else {
                this.members['readers'] = {[userID]: email};
            }
        } else {
            if ('writers' in this.members) {
                Object.assign(this.members['writers'], {[userID]: email});
            } else {
                this.members['writers'] = {[userID]: email};            
            }
        }  
        this.membersChanged.next(this.members);
    }

    removeMember(email: string) {        
        Object.keys(this.members).forEach(permission => { 
            if (permission !== 'admin') {
                Object.keys(this.members[permission]).forEach(userID => {
                    if (this.members[permission][userID] === email) {
                        delete this.members[permission][userID];
                    }
                })
            }                 
        });

        this.membersChanged.next(this.members);
    }

    isUserAlreadyMember(userEmail: string) {
        return Object.keys(this.members).some(key => 
            Object.values(this.members[key]).some(email => email === userEmail))
    } 

    isCurrentUserAdmin() {
        return this.isAdmin;
    }

    getCurrentUserPermissions() {
        return this.readOnlyAccess;
    }

    setCurrentUserPermisssions(user: User) {
        if (user.id === this.members['admin']) {
            this.isAdmin = true;
            this.readOnlyAccess = false;
        } else {
            this.isAdmin = false;
        }
    
        if (!this.isAdmin) {
            if (this.members['writers']) {
                this.readOnlyAccess = !Object.keys(this.members['writers']).some(key => key === user.id)
            } else {
                this.readOnlyAccess = true;
            }      
        } 

        this.adminStatusChanged.next(this.isAdmin);
        this.memberPermissionsChanged.next(this.readOnlyAccess);
    }
}