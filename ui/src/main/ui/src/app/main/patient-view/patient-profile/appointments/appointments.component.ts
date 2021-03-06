import {Component, OnInit} from '@angular/core';
import {CommonUtil} from "../../../../util/common.util";
import {AppointmentService} from "../../../../services/appointment.service";
import {Router} from "@angular/router";
import {PatientAppointmentModel} from "../../../../models/patient.appointment.model";
import {Comparator} from "clarity-angular";

class DateComparator implements Comparator<PatientAppointmentModel> {
  compare(a: PatientAppointmentModel, b: PatientAppointmentModel) {
    return +new Date(b.date) - +new Date(a.date);
  }
}

@Component({
              moduleId: module.id,
              selector: 'appointments-component',
              templateUrl: 'appointments.component.html',
              styleUrls: ["appointments.component.css"],
              providers: []
           })
export class AppointmentsComponent implements OnInit {
   private dateComparator = new DateComparator();
   private userId: number = 0;
   private appToCancel: number = 0;
   public cancelWarning: boolean = false;
   public currentComment: string = "";
   public openComment: boolean = false;
   private futureAppointments: PatientAppointmentModel[] = [];
   private pastAppointments: PatientAppointmentModel[] = [];

   constructor(private appointmentService: AppointmentService,
               private router: Router) {
   }

   private refreshPastAppointments() {
     this.appointmentService.getPatientPastAppointments(this.userId)
       .subscribe( data => this.pastAppointments = data,
         err => console.log(err));
   }

   private refreshFutureAppointments() {
     this.appointmentService.getPatientFutureAppointments(this.userId)
       .subscribe( data => this.futureAppointments = data,
         err => console.log(err));
   }

   openProfile(id:number){
     this.router.navigate(["patient/result/", id]);
   }

   canCancel(date){
     let now = Date.now();
     let hours = Math.abs(date - now) / 36e5;
     return hours>1;
   }

  openCancelDialog(id){
    this.appToCancel = id;
    this.cancelWarning = true;
  }

  hasComment(comment){
    return comment != null && comment != '';
  }

  viewComment(comment){
    this.currentComment = comment;
    this.openComment = true;
  }

  cancelAppointment(){
    this.appointmentService.cancelAppointment(this.appToCancel, this.userId).subscribe( success => {
      if(success){
        this.cancelWarning = false;
        this.refreshFutureAppointments();
      }
    }, err => console.log(err));
  }

   ngOnInit() {
     this.userId = CommonUtil.getSessionUserId();
     this.refreshFutureAppointments();
     this.refreshPastAppointments();
   }
}
