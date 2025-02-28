import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


 class VideoDetail{
  @Prop({type:String })
  title: string;

  @Prop({type:String })
  url: string;

  @Prop({type:String})
  length: string;

  @Prop()
  thumbnail:string
}


@Schema({_id:true, timestamps:true})
export class Video {
  @Prop()
  type:string

  @Prop([{type:VideoDetail, require:true}])
  video:[VideoDetail]
}

export const VideoSchema = SchemaFactory.createForClass(Video);
