import CloudFlare
import os

def chunks(l, n):
    """Yield successive n-sized chunks from l."""
    for i in range(0, len(l), n):
        yield l[i:i + n]

def main():
    cf = CloudFlare.CloudFlare()
    paths = []
    for subdir, dirs, files in os.walk("./"):
        if (subdir == "./"):
            for file in files:
                paths.append(subdir.replace("./", "https://spiralframework.info") + "/" + file)
        else:
            for file in files:
                paths.append(subdir.replace("./", "https://spiralframework.info/") + "/" + file)
    for list in chunks(paths, 30):
        try:
            cf.zones.purge_cache.post("391427c4a21b8d2008a8b05f92ad4329", data = {'files': list})
            print('purged ' + str(len(list)) + ' paths: ' + str(list) + "\n")
        except CloudFlare.exceptions.CloudFlareAPIError as e:
            exit('purge cache - %d %s - api call failed' % (e, e))

if __name__ == '__main__':
    main()