import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors, ThemeColors } from '@/constants/colors';

const LAST_UPDATED = '20 février 2026';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Politique de confidentialité',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerBackTitle: 'Retour',
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Dernière mise à jour : {LAST_UPDATED}</Text>

        <Text style={styles.intro}>
          La présente Politique de Confidentialité décrit la manière dont Capasseoupas (ci-après « nous », « notre » ou « l'Éditeur ») collecte, utilise et protège vos données personnelles lorsque vous utilisez l'application Capasseoupas (ci-après « l'Application »), conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et à la loi n°78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés.
        </Text>

        <Text style={styles.heading}>1. Responsable du traitement</Text>
        <Text style={styles.body}>
          Le responsable du traitement des données personnelles est Capasseoupas, joignable à l'adresse : contact@capasseoupas.app.
        </Text>

        <Text style={styles.heading}>2. Données collectées</Text>
        <Text style={styles.body}>
          Dans le cadre de l'utilisation de l'Application, nous pouvons collecter les données suivantes :
        </Text>
        <Text style={styles.subheading}>2.1 Données fournies par l'utilisateur</Text>
        <Text style={styles.bullet}>• Signalements de lieux (nom du commerce, adresse, catégorie, statut d'acceptation Amex).</Text>
        <Text style={styles.bullet}>• Commentaires optionnels associés aux signalements.</Text>
        <Text style={styles.subheading}>2.2 Données collectées automatiquement</Text>
        <Text style={styles.bullet}>• Identifiant anonyme de l'appareil (pour distinguer les contributions).</Text>
        <Text style={styles.bullet}>• Données de géolocalisation (uniquement lorsque vous autorisez l'accès à votre position, pour afficher la carte et les lieux à proximité).</Text>
        <Text style={styles.bullet}>• Données techniques (type d'appareil, système d'exploitation, version de l'Application).</Text>
        <Text style={styles.subheading}>2.3 Données que nous ne collectons PAS</Text>
        <Text style={styles.bullet}>• Nom, prénom, adresse e-mail (sauf si vous nous contactez spontanément).</Text>
        <Text style={styles.bullet}>• Données bancaires ou informations relatives à vos cartes de paiement.</Text>
        <Text style={styles.bullet}>• Données sensibles au sens de l'article 9 du RGPD.</Text>

        <Text style={styles.heading}>3. Finalités et bases légales du traitement</Text>
        <Text style={styles.body}>
          Vos données sont traitées pour les finalités suivantes :
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Finalité</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Base légale</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Affichage des lieux sur la carte</Text>
            <Text style={styles.tableCell}>Intérêt légitime (Art. 6.1.f RGPD)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Enregistrement et affichage des signalements</Text>
            <Text style={styles.tableCell}>Intérêt légitime (Art. 6.1.f RGPD)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Géolocalisation pour afficher les lieux proches</Text>
            <Text style={styles.tableCell}>Consentement (Art. 6.1.a RGPD)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Amélioration de l'Application et correction de bugs</Text>
            <Text style={styles.tableCell}>Intérêt légitime (Art. 6.1.f RGPD)</Text>
          </View>
        </View>

        <Text style={styles.heading}>4. Durée de conservation</Text>
        <Text style={styles.body}>
          Les signalements sont conservés tant qu'ils sont pertinents pour la communauté. Les données techniques sont conservées pour une durée maximale de 12 mois. Vous pouvez demander la suppression de vos contributions à tout moment en nous contactant.
        </Text>

        <Text style={styles.heading}>5. Partage des données</Text>
        <Text style={styles.body}>
          Nous ne vendons, ne louons et ne partageons pas vos données personnelles avec des tiers à des fins commerciales. Vos données peuvent être partagées uniquement dans les cas suivants :
        </Text>
        <Text style={styles.bullet}>• Avec des prestataires techniques nécessaires au fonctionnement de l'Application (hébergement, services cartographiques), agissant en tant que sous-traitants conformément à l'article 28 du RGPD.</Text>
        <Text style={styles.bullet}>• Si la loi l'exige, sur demande d'une autorité judiciaire ou administrative compétente.</Text>

        <Text style={styles.heading}>6. Transferts de données hors UE</Text>
        <Text style={styles.body}>
          Certains de nos prestataires techniques (notamment les services cartographiques Google Maps) peuvent traiter des données en dehors de l'Union européenne. Dans ce cas, des garanties appropriées sont mises en place conformément au chapitre V du RGPD, notamment les clauses contractuelles types adoptées par la Commission européenne ou le cadre de protection des données UE-États-Unis (EU-US Data Privacy Framework).
        </Text>

        <Text style={styles.heading}>7. Sécurité des données</Text>
        <Text style={styles.body}>
          Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction, conformément à l'article 32 du RGPD. Cela inclut le chiffrement des données en transit et la limitation de l'accès aux données au personnel autorisé.
        </Text>

        <Text style={styles.heading}>8. Vos droits</Text>
        <Text style={styles.body}>
          Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :
        </Text>
        <Text style={styles.bullet}>• Droit d'accès (Art. 15 RGPD) : obtenir une copie de vos données personnelles.</Text>
        <Text style={styles.bullet}>• Droit de rectification (Art. 16 RGPD) : corriger des données inexactes.</Text>
        <Text style={styles.bullet}>• Droit à l'effacement (Art. 17 RGPD) : demander la suppression de vos données.</Text>
        <Text style={styles.bullet}>• Droit à la limitation du traitement (Art. 18 RGPD) : restreindre l'utilisation de vos données.</Text>
        <Text style={styles.bullet}>• Droit à la portabilité (Art. 20 RGPD) : recevoir vos données dans un format structuré.</Text>
        <Text style={styles.bullet}>• Droit d'opposition (Art. 21 RGPD) : vous opposer au traitement de vos données.</Text>
        <Text style={styles.bullet}>• Droit de retirer votre consentement à tout moment pour les traitements fondés sur le consentement.</Text>
        <Text style={styles.body}>
          Pour exercer ces droits, contactez-nous à : contact@capasseoupas.app. Nous répondrons à votre demande dans un délai de 30 jours conformément au RGPD.
        </Text>

        <Text style={styles.heading}>9. Réclamation auprès de la CNIL</Text>
        <Text style={styles.body}>
          Si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD, vous avez le droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
        </Text>
        <Text style={styles.bullet}>• En ligne : www.cnil.fr</Text>
        <Text style={styles.bullet}>• Par courrier : CNIL, 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, France</Text>

        <Text style={styles.heading}>10. Cookies et technologies similaires</Text>
        <Text style={styles.body}>
          L'Application n'utilise pas de cookies. Seul un identifiant anonyme est stocké localement sur votre appareil pour distinguer les contributions. Cet identifiant ne permet pas de vous identifier personnellement.
        </Text>

        <Text style={styles.heading}>11. Protection des mineurs</Text>
        <Text style={styles.body}>
          L'Application n'est pas destinée aux enfants de moins de 16 ans. Nous ne collectons pas sciemment de données personnelles de mineurs. Si vous êtes parent ou tuteur et que vous pensez que votre enfant nous a communiqué des données, veuillez nous contacter pour que nous puissions les supprimer.
        </Text>

        <Text style={styles.heading}>12. Modifications de la Politique</Text>
        <Text style={styles.body}>
          Nous pouvons mettre à jour cette Politique de Confidentialité à tout moment. En cas de modification substantielle, nous vous en informerons via l'Application. Nous vous encourageons à consulter régulièrement cette page.
        </Text>

        <Text style={styles.heading}>13. Contact</Text>
        <Text style={styles.body}>
          Pour toute question relative à cette Politique de Confidentialité ou à vos données personnelles, contactez-nous à : contact@capasseoupas.app
        </Text>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  lastUpdated: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textTertiary,
    marginBottom: 16,
  },
  intro: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
    paddingLeft: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    padding: 10,
    lineHeight: 18,
  },
  tableCellHeader: {
    fontWeight: '600' as const,
    color: colors.textPrimary,
    backgroundColor: colors.searchBg,
  },
});
