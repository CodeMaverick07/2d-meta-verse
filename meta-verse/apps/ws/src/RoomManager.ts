import type {User} from './User';
import { OutgoingMessage } from './types';

export class RoomManager {
    rooms:Map<String,User[]> = new Map();
    static instance: RoomManager;
    private constructor(){
        this.rooms = new Map();
    }
    static getInstance(){
        if (!this.instance){
            this.instance = new RoomManager();
        }
        return this.instance;
    }
    public removeUser(user:User,spaceId:string){
        if (!this.rooms.has(spaceId)){
            return;
        }
        this.rooms.set(spaceId,(this.rooms.get(spaceId)!.filter((u:User) => u.id !== user.id)?? []));
    }
    public addUser(user:User,spaceId:string){
        if(!this.rooms.has(spaceId)){
            this.rooms.set(spaceId,[user]);
            return;
        }
        this.rooms.set(spaceId,[...this.rooms.get(spaceId)!,user]);
    }
    public broadcast(user:User,roomId:string,message:OutgoingMessage){
        if (!this.rooms.has(roomId)){
            return;
        }
        this.rooms.get(roomId)!.forEach((u)=>{
            if(u.id !== user.id){
                u.send(message)
            }
        })
    }
}
