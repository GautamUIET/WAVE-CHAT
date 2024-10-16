import { currentProfile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { redirectToSignIn } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'


interface props{
  params:{
    serverId: string
  }

}
const serverU = async({
  params
}: props) => {
    const profile = await currentProfile();
    if (!profile) {
      return redirectToSignIn();
    }

    const server = await db.server.findUnique({
      where: {
        id: params.serverId,
         members:{
          some:{
            profileId: profile.id
          }
         }
      },
      include:{
        channels:{
          where:{
            name:"general"
          },
          orderBy:{
            createdAt:"asc"
          },

        }
      }


    })

    const initialChannel = server?.channels[0];
    if(!initialChannel){
      return null;
    }

  return redirect(`/servers/${params.serverId}/channels/${initialChannel.id}`);
}

export default serverU