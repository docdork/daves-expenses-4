import { Component } from '@angular/core';
import { PhotoService, UserPhoto } from '../services/photo.service';
import { Storage } from '@ionic/storage-angular';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  description: any;
  amount: any;
  e: any;
  constructor(
    public photoService: PhotoService,
    private storage: Storage,
    public actionSheetController: ActionSheetController
  ) {}

  public expenseContentList: {
    id: string;
    dateTime: String;
    description: String;
    amount: Number;
    picture: UserPhoto;
  }[] = [];

  id: string = '';
  runningTotal = 0.0;
  currentPhoto: UserPhoto | undefined;

  refreshScreen() {
    this.expenseContentList = []; //empty the array that displays.

    //refill the array from storage.
    this.runningTotal = 0;
    this.storage.forEach((value: any) => {
      const expenseItem = {
        id: value.id,
        dateTime: value.dateTime,
        description: value.description,
        amount: value.amount,
        picture: value.picture,
      };
      this.expenseContentList.push(expenseItem);
      this.runningTotal = this.runningTotal + expenseItem.amount;
    });
  }

  async ngOnInit() {
    await this.storage.create();

    if (this.photoService.photos) {
      await this.photoService.loadSaved();
    }

    //start up and refresh actions
    this.refreshScreen();
  }

  async clearAll() {
    await this.storage.clear();
    for (let photo of this.photoService.photos) {
      await this.photoService.deletePicture(photo, 0);
    }
    this.refreshScreen();
  }

  isModalOpen = false; //state value for open expense input modal

  async submitExpense() {
    //on clicking the submit button
    this.id = Math.random().toString();
    await this.storage.set(this.id, {
      id: this.id,
      dateTime: Date(),
      description: this.description,
      amount: this.amount,
      picture: this.photoService.photos[0],
    });

    this.refreshScreen();

    this.isModalOpen = false; //close the form
    this.description = '';
    this.amount = undefined;
    this.currentPhoto = undefined;
  }

  //initiate the form modal when plus is clicked.
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  public async removeExpense(expenseId: string) {
    await this.storage.remove(expenseId);
    this.refreshScreen();
  }

  async deletePhoto(photoId: UserPhoto, position: number) {
    await this.photoService.deletePicture(photoId, position);
  }

  public async showActionSheet(expense: any, index: number) {
    console.log(expense.id);
    console.log(index);
    const actionSheet = await this.actionSheetController.create({
      header: 'Expense',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            console.log('delete clicked');
            this.removeExpense(expense.id);
            this.deletePhoto(expense.picture, index);
            console.log(expense.picture);
          },
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            // Auto close
          },
        },
      ],
    });
    await actionSheet.present();
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
    this.currentPhoto = this.photoService.photos[0];
  }
}
