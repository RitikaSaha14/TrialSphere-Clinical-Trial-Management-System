import { PrismaClient, StudyStatus, ParticipantStatus } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
 await prisma.participant.deleteMany(); await prisma.milestone.deleteMany(); await prisma.study.deleteMany(); await prisma.site.deleteMany()
 const studies = await Promise.all([
  prisma.study.create({data:{protocolCode:'TS-ONC-024',title:'Oncology Outcomes Study',phase:'Phase III',status:StudyStatus.Recruiting,targetEnrollment:300,currentEnrollment:218,startDate:new Date('2026-01-15')}}),
  prisma.study.create({data:{protocolCode:'TS-CARD-018',title:'Cardiovascular Safety Trial',phase:'Phase II',status:StudyStatus.Active,targetEnrollment:180,currentEnrollment:156,startDate:new Date('2026-02-10')}}),
  prisma.study.create({data:{protocolCode:'TS-NEU-011',title:'Neurology Research Program',phase:'Phase II',status:StudyStatus.Planning,targetEnrollment:120,currentEnrollment:0,startDate:new Date('2026-08-01')}}),
  prisma.study.create({data:{protocolCode:'TS-IMM-032',title:'Immunology Efficacy Study',phase:'Phase III',status:StudyStatus.Recruiting,targetEnrollment:250,currentEnrollment:194,startDate:new Date('2026-03-12')}}),
  prisma.study.create({data:{protocolCode:'TS-RESP-007',title:'Respiratory Health Study',phase:'Phase IV',status:StudyStatus.Active,targetEnrollment:200,currentEnrollment:172,startDate:new Date('2026-01-28')}})
 ])
 await prisma.site.createMany({data:[
  {name:'Northstar Research Center',city:'Boston',country:'United States',studyCount:6},
  {name:'Meridian Clinical Institute',city:'London',country:'United Kingdom',studyCount:4},
  {name:'Summit Medical Research',city:'Toronto',country:'Canada',studyCount:5},
  {name:'Riverbend Research Network',city:'Austin',country:'United States',status:'Onboarding',studyCount:2},
  {name:'Cedar Grove Clinical Unit',city:'Dublin',country:'Ireland',studyCount:3},
  {name:'BluePeak Research Partners',city:'Singapore',country:'Singapore',studyCount:4}
 ]})
 const siteNames=['Northstar Research Center','Meridian Clinical Institute','Summit Medical Research','Cedar Grove Clinical Unit','BluePeak Research Partners']
 const demoPeople = [
  ['PT-1001',0,0,ParticipantStatus.Enrolled],['PT-1002',1,1,ParticipantStatus.Screening],['PT-1003',3,2,ParticipantStatus.Enrolled],['PT-1004',4,3,ParticipantStatus.Withdrawn],['PT-1005',0,4,ParticipantStatus.Screening]
 ] as const
 await prisma.participant.createMany({data:demoPeople.map(([code,study,site,status],i)=>({participantCode:code,studyId:studies[study].id,siteName:siteNames[site],status,enrolledAt:new Date(`2026-10-${14+i*2}`)}))})
 await prisma.milestone.createMany({data:[{studyId:studies[0].id,title:'Interim enrollment review',dueDate:new Date('2026-12-01')},{studyId:studies[1].id,title:'Site activation review',dueDate:new Date('2026-12-15')}]})
 console.log('Seeded TrialSphere with fictional records.')
}
main().finally(()=>prisma.$disconnect())
